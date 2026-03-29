export function sendJson(res: any, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export function sendError(res: any, status: number, message: string) {
  sendJson(res, status, { error: message });
}

export function requireMethod(req: any, res: any, allowed: string[]): boolean {
  const method = (req.method || 'GET').toUpperCase();
  if (!allowed.includes(method)) {
    res.setHeader('Allow', allowed.join(', '));
    sendError(res, 405, `Method ${method} not allowed`);
    return false;
  }
  return true;
}

export async function parseJsonBody<T = any>(req: any): Promise<T> {
  if (req.body) {
    if (typeof req.body === 'string') {
      return JSON.parse(req.body) as T;
    }
    return req.body as T;
  }

  return new Promise<T>((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        resolve(parsed as T);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', (err: any) => reject(err));
  });
}

export function getAuthTokenFromRequest(req: any): string | null {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }

  const cookieHeader = req.headers?.cookie;
  if (typeof cookieHeader === 'string') {
    const tokenCookie = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('token='));
    if (tokenCookie) {
      return decodeURIComponent(tokenCookie.split('=').slice(1).join('='));
    }
  }

  return null;
}

