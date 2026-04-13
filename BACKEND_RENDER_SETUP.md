# Backend Configuration Changes for Render Deployment

This document shows the exact code changes needed to deploy the backend on Render.

## 1. Update `backend/src/server.ts` - Port Configuration

**BEFORE:**
```typescript
const PORT = 9000;

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
```

**AFTER:**
```typescript
const PORT = process.env.PORT || 9000; // ← Render sets process.env.PORT automatically

app.listen(PORT, "0.0.0.0", () => { // ← Listen on all interfaces
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

---

## 2. Update `backend/src/server.ts` - CORS Configuration

**BEFORE:**
```typescript
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
```

**AFTER:**
```typescript
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const corsOriginList = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
].filter(Boolean);

app.use(cors({
  origin: corsOriginList,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
}));
```

---

## 3. Update `backend/package.json` - Add Node.js Version

**Add this section** (after `"version": "1.0.0"`):
```json
{
  "name": "family-hub-backend",
  "version": "1.0.0",
  "engines": {
    "node": "18.x"
  },
  "description": "Family Hub School Management System - Express Backend",
  ...rest of config
}
```

---

## 4. Environment Variables for Render

Create `.env` file in `backend/` directory:

```bash
# ============================================
# Server Configuration
# ============================================
PORT=9000
NODE_ENV=production

# ============================================
# Database Configuration
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=family-hub
MONGODB_DB_NAME=family_hub

# ============================================
# Authentication & Security
# ============================================
JWT_SECRET=your-very-long-random-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# ============================================
# Frontend Configuration (for CORS)
# ============================================
FRONTEND_URL=https://your-app.vercel.app
```

**Important for Render:**
- In Render Dashboard, add these **exactly as above** under Environment Variables
- Use the connection string from MongoDB Atlas
- Generate a strong JWT_SECRET (at least 32 random characters)

---

## 5. Verify Health Check Endpoint Exists

**In `backend/src/server.ts` (around line 45)**:
```typescript
// Health check endpoint (required for Render)
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});
```

This endpoint is used by Render to check if service is running.
Test with: `curl https://your-service.onrender.com/api/health`

---

## 6. Create `render.yaml` in Project Root

Create file `render.yaml` (NOT in backend folder):

```yaml
services:
  - type: web
    name: family-hub-backend
    env: node
    region: oregon
    plan: free
    
    buildCommand: "cd backend && npm install && npm run build"
    startCommand: "cd backend && npm start"
    
    envVars:
      - key: NODE_ENV
        value: production
    
    healthCheckPath: /api/health
    healthCheckInterval: 300
```

---

## 7. Update `backend/tsconfig.json` (Already Done)

Verify this is set to CommonJS (not ES modules):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",  // ← MUST be commonjs
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    ...rest
  }
}
```

---

## Deployment Process

### Local Testing First

Before pushing to Render, test locally:

```bash
# 1. Install backend deps
cd backend
npm install

# 2. Build TypeScript
npm run build

# 3. Start the server
npm start

# 4. Test in another terminal
curl http://localhost:9000/api/health
```

Expected output:
```json
{
  "status": "ok",
  "timestamp": "2026-04-12T10:30:45.123Z",
  "environment": "production",
  "uptime": 2.345
}
```

### Deploy to Render

1. **Commit and push all changes to GitHub:**
   ```bash
   git add .
   git commit -m "Setup: Configure backend for Render deployment"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Create new Web Service
   - Connect GitHub repository
   - Render will auto-detect `render.yaml`
   - Set environment variables
   - Deploy

3. **Monitor logs:**
   - Dashboard → Logs tab
   - Look for: `✅ Server running on port 10000`

---

## Environment Variables Summary

| Variable | Local Dev | Render Production |
|----------|-----------|-------------------|
| `PORT` | Not set (default 9000) | `10000` (set by Render) |
| `NODE_ENV` | `development` | `production` |
| `MONGODB_URI` | `mongodb://localhost:27017` | `mongodb+srv://user:pass@cloud` |
| `JWT_SECRET` | Any string (testing) | Strong 32-char secret |
| `FRONTEND_URL` | `http://localhost:5173` | `https://xxxx.vercel.app` |

---

## Troubleshooting

### Build fails with "Module not found"
→ Check TypeScript config: `"module": "commonjs"`

### "Cannot find module at startup"
→ Run `npm run build` locally first to verify
→ Check `dist/` folder exists after build

### Port conflicts / "EADDRINUSE"
→ Don't hardcode 9000; use `process.env.PORT`
→ Render provides PORT automatically

### CORS errors in frontend
→ Verify `FRONTEND_URL` is correct in Render env vars
→ Run `curl` to test backend responds
→ Check browser console for exact error

### Database connection fails
→ Verify MongoDB connection string in `.env`
→ Check MongoDB IP whitelist includes 0.0.0.0/0
→ Test locally first: `npm run build && npm start`

