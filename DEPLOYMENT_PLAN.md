# Deployment Implementation Plan: Render (Backend) + Vercel (Frontend)

## Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                       │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
    ┌─────▼──────────┐        ┌─────────▼─────────┐
    │  VERCEL        │        │   RENDER          │
    │  (Frontend)    │        │   (Backend API)   │
    │ React + Vite   │        │  Express.js       │
    │   Port 3000    │        │   Port 10000      │
    └─────┬──────────┘        └──────┬────────────┘
          │                          │
          │     API Calls            │
          └──────────────────────────┤
                                     │
                        ┌────────────▼─────────────┐
                        │   MongoDB Atlas Cloud    │
                        │  (Shared Database)       │
                        └──────────────────────────┘
```

---

## Phase 1: Pre-Deployment Setup

### 1.1 Create Render Account & Project
- [ ] Sign up at https://render.com
- [ ] Create new Web Service
- [ ] Connect GitHub repository (or use manual deployment)
- [ ] Note the Render dashboard URL and service URL

### 1.2 Create Vercel Account & Project
- [ ] Sign up at https://vercel.com
- [ ] Create new Project from GitHub
- [ ] Link to your family-hub repository
- [ ] Note the Vercel project URL

### 1.3 MongoDB Atlas (if not already set up)
- [ ] Create cluster at https://www.mongodb.com/cloud/atlas
- [ ] Create database user (not your email)
- [ ] Whitelist IP: Allow 0.0.0.0/0 (all IPs - for cloud deployments)
- [ ] Get connection string: `mongodb+srv://user:password@cluster.mongodb.net`
- [ ] Copy connection string (you'll need this for both deployments)

---

## Phase 2: Backend Deployment (Render)

### 2.1 Update Backend Configuration

**Create `render.yaml` in project root:**
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
      - key: PORT
        value: 10000
```

### 2.2 Set Environment Variables in Render Dashboard

Navigate to: **Settings → Environment**

Add these variables:
| Key | Value | Source |
|-----|-------|--------|
| `NODE_ENV` | `production` | Set in Render |
| `PORT` | `10000` | Set in Render (Render default) |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster...` | MongoDB Atlas |
| `MONGODB_DB_NAME` | `family_hub` | Same as local |
| `JWT_SECRET` | `<randomly-generated-32-char-string>` | Generate new |
| `JWT_EXPIRES_IN` | `7d` | Same as local |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your Vercel domain |

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Update Backend for Render Compatibility

**Modify `backend/src/server.ts` (Port Configuration):**
```typescript
const PORT = process.env.PORT || 9000;  // ← Change to handle Render's PORT env var

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
```

**Update `backend/package.json` (Add "engines" field):**
```json
{
  "name": "family-hub-backend",
  "version": "1.0.0",
  "engines": {
    "node": "18.x"
  },
  "scripts": { ... }
}
```

### 2.4 Update Backend CORS Settings

Modify `backend/src/server.ts` to accept Vercel frontend:

```typescript
const corsOriginList = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: corsOriginList,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

### 2.5 Deploy Backend to Render

**Option A: GitHub Integration (Auto-Deploy)**
1. Push these changes to your GitHub repository
2. Render will auto-detect and deploy
3. Monitor build logs in Render Dashboard

**Option B: Manual Deployment**
```bash
# Install Render CLI (or use web dashboard)
npm install -g render-cli

# or use Render Dashboard UI to connect repo
```

**After Deployment:**
- Test health endpoint: `https://your-service.onrender.com/api/health`
- Note the Render service URL (you'll need this for frontend)

---

## Phase 3: Frontend Deployment (Vercel)

### 3.1 Update Frontend Environment Configuration

**Modify `vercel.json` (Remove API functions, simplify config):**
```json
{
  "framework": "vite",
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://your-backend.onrender.com/api"
  },
  "nodeVersion": "18.x"
}
```

### 3.2 Update Frontend .env.local

**Create/Update `.env.local` in root directory:**
```bash
# API endpoint pointing to Render backend
VITE_API_URL=https://family-hub-backend-xxxxx.onrender.com/api

# School branding variables
VITE_SCHOOL_DISPLAY_NAME_MR=वैनतेय प्राथमिक विद्या मंदिर
VITE_SCHOOL_HERO_TITLE_BASE_MR=वैनतेय प्राथमिक
VITE_SCHOOL_HERO_TITLE_ACCENT_MR=विद्या मंदिर
# ... rest of school config from .env.example
```

### 3.3 Configure Vercel Environment Variables

In **Vercel Dashboard → Settings → Environment Variables:**

Add:
```
VITE_API_URL = https://family-hub-backend-xxxxx.onrender.com/api
# ... all VITE_SCHOOL_* variables
```

### 3.4 Deploy Frontend to Vercel

**Push to GitHub:**
```bash
git add .
git commit -m "Deploy: Update API URL for Render backend"
git push origin main
```

Vercel will auto-deploy when changes are pushed.

**Manual Deploy (if needed):**
```bash
vercel deploy --prod
```

**After Deployment:**
- Access frontend at Vercel URL
- Verify API calls reach Render backend

---

## Phase 4: Testing & Validation

### 4.1 Test Backend

```bash
# Terminal 1: Check Render status
curl https://your-backend.onrender.com/api/health
# Expected: { "status": "ok", "timestamp": "..." }

# Check if DB is connected
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@google.com","password":"Admin@123"}'
```

### 4.2 Test Frontend

1. Open Vercel frontend URL
2. Login with test credentials:
   - Email: `admin@google.com`
   - Password: `Admin@123` (or your seeded password)
3. Verify API calls work (check browser Network tab)
4. Test different user roles (teacher, parent, student)

### 4.3 Test Full Integration

- [ ] Login/logout works
- [ ] Create new user (admin panel)
- [ ] Mark attendance (teacher role)
- [ ] View grades (student role)
- [ ] Monitor child (parent role)
- [ ] Check MongoDB Atlas - verify data is being saved

---

## Phase 5: Production Hardening

### 5.1 Backend Security

- [ ] Set `NODE_ENV=production` in Render
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Verify CORS allows only Vercel domain
- [ ] Enable MongoDB IP whitelist (limit to Render IPs if possible)
- [ ] Set up error logging/monitoring (optional: Sentry, LogRocket)

### 5.2 Frontend Security

- [ ] Remove dev dependencies before build
- [ ] Verify no API keys/secrets in frontend code
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Configure Content Security Policy headers

### 5.3 Database Backups

- [ ] Enable MongoDB Atlas automated backups
- [ ] Test restore procedure
- [ ] Document backup policy

---

## Phase 6: CI/CD Pipeline (Optional)

### 6.1 GitHub Actions for Testing

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install frontend
        run: npm install
      
      - name: Build frontend
        run: npm run build
      
      - name: Build backend
        run: cd backend && npm install && npm run build
      
      - name: Run tests
        run: cd backend && npm test
```

---

## Deployment URLs Reference

After deployment, update these URLs in your team documentation:

| Component | URL | Provider |
|-----------|-----|----------|
| Frontend | `https://******.vercel.app` | Vercel |
| Backend API | `https://family-hub-backend-**.onrender.com` | Render |
| Database | `mongodb+srv://******.mongodb.net` | MongoDB Atlas |
| Admin Panel | `https://******.vercel.app/admin` | Vercel |

---

## Troubleshooting Common Issues

### Issue: "Cannot find module" errors on Render
**Solution:** Ensure `npm run build` completes successfully locally first
```bash
cd backend && npm run build && npm start
```

### Issue: Frontend API calls timeout
**Solution:** 
- Check Render service is running: `https://your-backend.onrender.com/api/health`
- Verify `VITE_API_URL` env var in Vercel is correct
- Check CORS is enabled in backend

### Issue: MongoDB connection fails
**Solution:**
- Verify connection string in Render env vars
- Whitelist 0.0.0.0/0 in MongoDB Atlas IP Whitelist
- Check user credentials in connection string

### Issue: Free tier Render service goes to sleep
**Solution:** Upgrade to Starter plan ($7/month) or ping service periodically

---

## Estimated Timeline & Costs

| Phase | Time | Cost |
|-------|------|------|
| Setup accounts | 30 min | $0 (free tier) |
| Backend deployment | 1-2 hrs | $0-7/month |
| Frontend deployment | 30 min | $0 (free) |
| Testing & validation | 1-2 hrs | $0 |
| **Total** | **3-5 hrs** | **$0-7/month** |

**Cost Breakdown:**
- Vercel: Free tier sufficient for most use cases
- Render: Free tier ($0), Starter ($7/month) if no sleep needed
- MongoDB Atlas: Free tier 512MB (or $57/month shared cluster)

