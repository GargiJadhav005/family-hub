# Family Hub - Deployment Guide

This guide explains how to deploy the Family Hub application with its new folder structure (separate `frontend/` and `backend/` directories).

## Project Structure

The project is organized into two independent directories:

```
family-hub/
├── frontend/                 # React + Vite frontend application
│   ├── src/                 # React components, pages, hooks, contexts
│   ├── public/              # Static assets
│   ├── index.html           # Entry HTML file
│   ├── vite.config.ts       # Vite build configuration
│   ├── tailwind.config.ts   # Tailwind CSS configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── package.json         # Frontend dependencies
│   └── bun.lockb            # Dependency lock file (using Bun)
├── backend/                 # Node.js + Express backend API
│   ├── src/
│   │   ├── server.js        # Express server entry point
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Authentication & other middleware
│   │   └── utils/           # Utility functions
│   ├── package.json         # Backend dependencies
│   ├── .env.example         # Environment variables template
│   └── Procfile             # Process file for Render
├── vercel.json              # Vercel frontend deployment config
├── render.yaml              # Render backend deployment config
└── [documentation files]
```

---

## Local Development

### Prerequisites

- **Node.js** 18.x or higher
- **Bun** (recommended) or npm
- **Git**
- **MongoDB** (running locally or Atlas connection string)

### Setup

#### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
bun install  # or: npm install
```

**Backend:**
```bash
cd backend
npm install
```

#### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
# Copy from backend/.env.example
cp backend/.env.example backend/.env

# Then edit backend/.env with your settings:
NODE_ENV=development
PORT=9000
MONGODB_URI=mongodb://localhost:27017/family_hub  # or your Atlas URI
MONGODB_DB_NAME=family_hub
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env.local` or `frontend/.env.development`):
- This file is already configured via component environment variables in source code
- For local development, API requests proxy to `http://localhost:9000` (backend dev server)
- See `frontend/vite.config.ts` for proxy configuration

#### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start  # or: npm run dev (if available)
# Backend runs on http://localhost:9000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
bun run dev  # or: npm run dev
# Frontend runs on http://localhost:5173
```

**Test the connection:**
- Open http://localhost:5173 in your browser
- Frontend will proxy `/api/*` requests to backend on port 9000
- Check console for any errors

### Local Build Test

Test production builds locally:

**Frontend:**
```bash
cd frontend
bun run build  # or: npm run build
# Outputs to frontend/dist/
```

**Backend:**
```bash
cd backend
npm install  # ensure production dependencies
```

---

## Deployment

The application uses **two separate deployments**:

### Frontend Deployment: Vercel

**Platform:** [Vercel](https://vercel.com)

**Configuration File:** `vercel.json` (at root)

**How It Works:**
1. Push code to GitHub
2. Vercel automatically detects changes
3. Vercel reads `vercel.json` and sees `"rootDirectory": "frontend"`
4. Vercel runs: `cd frontend && npm install && npm run build`
5. Vercel serves `frontend/dist/` as the static site
6. Vercel injects environment variables from project settings

**Setup Steps:**

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import GitHub repository (family-hub)
   - Select root directory as `/` (or let Vercel auto-detect)

2. **Configure Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add the following variables (values for production):
     ```
     VITE_API_URL=https://family-hub-backend-xxxxx.onrender.com/api
     VITE_SCHOOL_DISPLAY_NAME_MR=वैनतेय प्राथमिक विद्या मंदिर
     VITE_SCHOOL_HERO_TITLE_BASE_MR=वैनतेय प्राथमिक
     VITE_SCHOOL_HERO_TITLE_ACCENT_MR=विद्या मंदिर
     VITE_SCHOOL_SHORT_NAME_MR=वैनतेय
     ```

3. **Deploy**
   - Vercel automatically deploys on each push to `main` branch
   - View deployment URL in Vercel dashboard
   - Each deployment creates a unique URL (e.g., family-hub-xxxxx.vercel.app)

**Troubleshooting:**
- Check Vercel build logs if deployment fails
- Ensure `rootDirectory: "frontend"` in vercel.json
- Verify environment variables are set correctly
- Test `cd frontend && npm run build` locally first

### Backend Deployment: Render

**Platform:** [Render](https://render.com)

**Configuration File:** `render.yaml` (at root)

**How It Works:**
1. Push code to GitHub
2. Render reads `render.yaml` and sees `rootDir: backend`
3. Render runs: `npm install` from `backend/` directory
4. Render starts: `node src/server.js` from `backend/` directory
5. Backend API runs on `https://family-hub-backend-xxxxx.onrender.com`

**Setup Steps:**

1. **Create Render Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository (family-hub)
   - Name: `family-hub-backend`
   - Environment: `Node`
   - Region: Choose closest to users
   - Plan: Free (or Starter for production)

2. **Configure Environment Variables** (in Render dashboard)
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=[your-mongodb-atlas-connection-string]
   MONGODB_DB_NAME=family_hub
   JWT_SECRET=[generate-a-strong-secret]
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://[your-vercel-domain]
   ```

3. **Deploy**
   - Render automatically deploys on each push to `main` branch
   - View logs in Render dashboard
   - Backend URL: https://family-hub-backend-xxxxx.onrender.com

**Important Notes:**
- Render free tier may have slower startups (cold starts)
- Upgrade to Starter plan ($7/month) if you need faster response times
- Ensure MongoDB connection string is from Atlas (or self-hosted with stable IP)

**Troubleshooting:**
- Check Render build logs for errors
- Verify `rootDir: backend` in render.yaml
- Test `node src/server.js` locally to ensure backend runs
- Ensure environment variables are set correctly
- Check MongoDB connection string

---

## Updating Deployments After Code Changes

### Push Code to GitHub

```bash
git add .
git commit -m "Your message"
git push origin main
```

### Frontend Auto-Deploy
- Vercel automatically detects push to `main`
- Builds and deploys within 2-5 minutes
- Check deployment status in Vercel dashboard

### Backend Auto-Deploy
- Render automatically detects push to `main`
- Builds and deploys within 3-10 minutes
- Check deployment status in Render dashboard

---

## Monitoring & Debugging

### Frontend (Vercel)

**View Logs:**
- Vercel Dashboard → Project → Deployments → Select deployment → View logs

**Common Issues:**
- Build fails: Check `frontend/package.json` and dependencies
- Environment variables not loaded: Verify in Vercel Environment Variables
- API calls fail: Check `VITE_API_URL` points to correct backend

### Backend (Render)

**View Logs:**
- Render Dashboard → Service → Logs

**Common Issues:**
- Server won't start: Check `backend/src/server.js` for errors
- Database connection fails: Verify `MONGODB_URI` and firewall rules
- Port issues: Ensure PORT=10000 is set
- Cold start timeouts: Upgrade to Starter plan

---

## Performance Optimization

### Frontend (Vercel)
- Vite automatically optimizes bundle with code splitting
- Static assets cached in Vercel's CDN
- Use `npm run build` locally to test production build size

### Backend (Render)
- MongoDB indexing on frequently queried fields
- Enable gzip compression in Express (configured in `backend/src/server.js`)
- Monitor response times in Render logs

---

## Security Checklist

- [ ] JWT_SECRET is strong and unique (not checked into Git)
- [ ] MONGODB_URI is from Atlas with proper IP whitelist
- [ ] FRONTEND_URL in backend matches deployed Vercel domain
- [ ] `.env` files are listed in `.gitignore`
- [ ] Never commit `.env` files to repository
- [ ] Use environment variables for all secrets (API keys, tokens, URIs)
- [ ] Enable HTTPS (automatic on Vercel and Render)

---

## Rollback Plan

If deployment breaks:

### Revert Vercel Deployment
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Revert Render Deployment
1. Go to Render Dashboard → Service → Settings
2. Click "Redeploy" on a previous deployment
3. Or revert Git commit and push: `git revert [commit-hash]`

---

## Additional Commands

**Frontend:**
```bash
cd frontend
npm run dev       # Development server on port 5173
npm run build     # Production build to frontend/dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint code quality check
npm run type-check # TypeScript type checking
npm run test      # Run tests (Vitest)
```

**Backend:**
```bash
cd backend
npm start         # Start server on port 9000 (or 10000 on Render)
npm run dev       # Development with auto-reload (if configured)
```

---

## Getting Help

- **Frontend Issues:** Check `frontend/` folder and Vercel logs
- **Backend Issues:** Check `backend/` folder and Render logs
- **Environment Variables:** Verify in both Vercel and Render dashboards
- **Database Issues:** Check MongoDB Atlas dashboard and connection string
- **Deployment Config:** Review `vercel.json` and `render.yaml`

---

**Last Updated:** April 2024
**Maintained By:** Family Hub Team
