# Render + Vercel Deployment Checklist

## Quick Start Checklist

### ✅ Pre-Deployment (Do This First)

#### Account Setup
- [ ] MongoDB Atlas account created with cluster
- [ ] Render account created (https://render.com)
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub repository ready with all code pushed

#### Credentials & Secrets
- [ ] MongoDB connection string copied: `mongodb+srv://...`
- [ ] JWT Secret generated: Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] MongoDB IP whitelist allows 0.0.0.0/0 (for cloud access)

---

### 🔧 Backend Configuration (Render)

#### Code Changes
- [ ] Updated backend `src/server.ts` to read `process.env.PORT`
- [ ] Updated `backend/package.json` - added `"engines": { "node": "18.x" }`
- [ ] Updated CORS in `backend/src/server.ts` to accept `FRONTEND_URL`
- [ ] Created `render.yaml` in project root
- [ ] All changes committed and pushed to GitHub

#### Render Dashboard Setup
- [ ] Created new Web Service in Render
- [ ] Connected GitHub repository
- [ ] Set environment variables:
  - `NODE_ENV`: `production`
  - `MONGODB_URI`: `mongodb+srv://...`
  - `MONGODB_DB_NAME`: `family_hub`
  - `JWT_SECRET`: (your generated secret)
  - `JWT_EXPIRES_IN`: `7d`
  - `FRONTEND_URL`: (will update after Vercel deployment)
- [ ] Verified build logs - no errors
- [ ] Noted Render service URL: `https://your-service.onrender.com`

#### Backend Testing
- [ ] Tested health endpoint:
  ```bash
  curl https://your-service.onrender.com/api/health
  ```
  Expected: `{ "status": "ok", "timestamp": "..." }`
- [ ] MongoDB connection verified in Render logs

---

### 🎨 Frontend Configuration (Vercel)

#### Code Changes
- [ ] Updated `vercel.json` for Vite (removed API functions)
- [ ] Created `.env.local` in root with `VITE_API_URL`
- [ ] All school branding variables added to `.env.local`
- [ ] All changes committed and pushed to GitHub

#### Vercel Dashboard Setup
- [ ] Imported repository from GitHub
- [ ] Set environment variables:
  - `VITE_API_URL`: `https://your-backend.onrender.com/api`
  - `VITE_SCHOOL_DISPLAY_NAME_MR`: `वैनतेय प्राथमिक विद्या मंदिर`
  - (All other VITE_SCHOOL_* variables)
- [ ] Verified build completed successfully
- [ ] Noted Vercel frontend URL: `https://your-app.vercel.app`

#### Update Render with Frontend URL
- [ ] Go back to Render dashboard
- [ ] Add/update `FRONTEND_URL`: `https://your-app.vercel.app`
- [ ] Redeploy backend: Click "Clear Cache & Redeploy"

#### Frontend Testing
- [ ] Opened Vercel URL in browser
- [ ] Tried logging in with: `admin@google.com` / `Admin@123`
- [ ] Checked browser Network tab - API calls go to Render backend

---

### 🧪 Full Integration Testing

- [ ] Login/Logout works
- [ ] Can navigate to admin dashboard
- [ ] Teacher can view student list
- [ ] Can create new homework (teacher)
- [ ] Can mark attendance (teacher)
- [ ] Check MongoDB Atlas - data appears in database
- [ ] Test different user roles (admin, teacher, parent, student)

---

### 🔐 Production Hardening

- [ ] Changed default admin password (if using seeded account)
- [ ] Verified JWT_SECRET is strong (32+ characters)
- [ ] Tested CORS - verify only Vercel domain is allowed
- [ ] MongoDB backups enabled in Atlas
- [ ] Error logging configured (optional: Sentry)
- [ ] Performance monitoring setup (optional: New Relic)

---

### 📋 Post-Deployment Validation

- [ ] Updated team documentation with new URLs
- [ ] Tested on multiple devices (desktop, mobile, tablet)
- [ ] Verified HTTPS works everywhere
- [ ] Tested with slow network (DevTools throttling)
- [ ] Checked Google Analytics (if configured)
- [ ] Verified email notifications work (if configured)

---

## URLs After Deployment

Save these for your team:

```
Frontend:     https://[YOUR_VERCEL_PROJECT].vercel.app
Backend API:  https://family-hub-backend-[ID].onrender.com
Database:     mongodb+srv://[USER]:[PASS]@[CLUSTER].mongodb.net
Admin Email:  admin@google.com
Admin URL:    https://[YOUR_VERCEL_PROJECT].vercel.app/admin
```

---

## Common Commands During Deployment

### Build Backend Locally (Test Before Deploying)
```bash
cd backend
npm install
npm run build
npm start
```

### Test API Locally
```bash
# With backend running locally
curl http://localhost:9000/api/health
```

### Rebuild on Render (if needed)
```bash
# Render Dashboard → Service → "Clear Cache & Redeploy"
```

### Deploy Frontend to Vercel (manual)
```bash
vercel deploy --prod
```

### Check Logs

**Render logs:**
- Dashboard → Service → Logs

**Vercel logs:**
- Dashboard → Project → Deployments → Select deployment → See logs

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| "Cannot find module" on Render | Rebuild backend locally first: `npm run build` |
| API calls timeout | Check `/api/health` endpoint responds |
| 404 errors on API routes | Verify `VITE_API_URL` points to Render backend |
| Login fails | Check MongoDB connection; verify JWT_SECRET set in Render |
| "CORS error" | Update `FRONTEND_URL` in Render env vars and redeploy |
| Port conflict errors | Render assigns PORT automatically; don't hardcode |

---

## Timeline Estimate

| Task | Time |
|------|------|
| Account setup | 15 min |
| Backend configuration | 30 min |
| Backend deployment | 10-15 min |
| Frontend configuration | 20 min |
| Frontend deployment | 5-10 min |
| Integration testing | 20-30 min |
| **Total** | **1.5-2.5 hours** |

Good luck! 🚀
