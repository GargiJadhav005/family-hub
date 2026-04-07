import type { ViteDevServer } from 'vite';
import { readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadHandler(filePath: string) {
  try {
    const module = await import(filePath);
    return module.default;
  } catch (err) {
    console.error(`[API] Failed to load handler ${filePath}:`, err);
    return null;
  }
}

function getRoutePath(filePath: string): string {
  let route = filePath
    .replace(/\.ts$/, '')
    .replace(/index$/, '')
    .replace(/\\/g, '/');

  if (route.includes('[')) {
    route = route.replace(/\[(\w+)\]/g, ':$1');
  }

  if (route.endsWith('/')) {
    route = route.slice(0, -1);
  }

  return '/api' + (route.startsWith('/api') ? route.slice(4) : route);
}

export function apiMiddleware() {
  const apiDir = path.resolve(__dirname, '../api');
  const handlers = new Map();
  let handlersLoaded = false;

  function loadHandlers(dir: string, prefix = ''): void {
    if (handlersLoaded) return;
    try {
      const files = readdirSync(dir);
      files.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          loadHandlers(fullPath, prefix + file + '/');
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
          const relativePath = prefix + file;
          const route = getRoutePath(relativePath);
          handlers.set(route, fullPath);
        }
      });
      handlersLoaded = true;
      console.log('[API] Routes loaded:', Array.from(handlers.keys()).sort());
    } catch (err) {
      console.error('[API] Error loading handlers:', err);
    }
  }

  return {
    name: 'api-middleware',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      loadHandlers(apiDir);
      
      return () => {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          if (!req.url || !req.url.startsWith('/api')) {
            return next();
          }

          try {
            const urlPath = req.url.split('?')[0];
            let handler = handlers.get(urlPath);

            if (!handler) {
              for (const [route, filePath] of handlers.entries()) {
                const paramPattern = route.replace(/:[^\/]+/g, '[^/]+');
                const regex = new RegExp(`^${paramPattern.replace(/\//g, '\\/')}($|\\?)`);
                
                if (regex.test(urlPath)) {
                  handler = filePath;
                  req.query = {};
                  const routeParams = route.match(/:[^\/:]+/g) || [];
                  const routeParts = route.split('/').filter(p => p);
                  const pathParts = urlPath.split('/').filter(p => p);
                  
                  routeParams.forEach((param) => {
                    const paramName = param.slice(1);
                    const idx = routeParts.findIndex(p => p === param);
                    if (idx >= 0 && pathParts[idx]) {
                      req.query[paramName] = decodeURIComponent(pathParts[idx]);
                    }
                  });
                  break;
                }
              }
            }

            if (!handler) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Not Found', path: urlPath }));
              return;
            }

            const handlerFn = await loadHandler(handler);
            if (!handlerFn) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Handler not found' }));
              return;
            }

            req.method = (req.method || 'GET').toUpperCase();
            console.log(`[API] ${req.method} ${req.url} -> ${handler}`);
            
            await handlerFn(req, res);
          } catch (err) {
            console.error(`[API] Error handling ${req.url}:`, err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
          }
        });
      };
    },
  };
}
