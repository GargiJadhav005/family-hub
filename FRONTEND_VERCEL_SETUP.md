# Frontend Configuration Changes for Vercel Deployment

This document shows the exact code changes needed to deploy the frontend on Vercel.

## 1. Update `vercel.json` (Already Updated)

The root `vercel.json` has been updated to:

```json
{
  "framework": "vite",
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "nodeVersion": "18.x",
  "env": {
    "VITE_API_URL": "@VITE_API_URL",
    "VITE_SCHOOL_DISPLAY_NAME_MR": "@VITE_SCHOOL_DISPLAY_NAME_MR",
    "VITE_SCHOOL_HERO_TITLE_BASE_MR": "@VITE_SCHOOL_HERO_TITLE_BASE_MR",
    "VITE_SCHOOL_HERO_TITLE_ACCENT_MR": "@VITE_SCHOOL_HERO_TITLE_ACCENT_MR",
    "VITE_SCHOOL_SHORT_NAME_MR": "@VITE_SCHOOL_SHORT_NAME_MR"
  },
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

**Key Points:**
- ✅ Removed API functions (backend is now on Render, not Vercel)
- ✅ Simplified config for static SPA deployment
- ✅ Environment variables marked with `@` will be injected by Vercel

---

## 2. Create/Update `.env.local` in Root Directory

**File:** `.env.local` (in project root, NOT in frontend/)

```bash
# ============================================
# API Configuration
# ============================================
# Backend running on Render
VITE_API_URL=https://family-hub-backend-xxxxx.onrender.com/api

# ============================================
# School Display Configuration (Marathi)
# ============================================
VITE_SCHOOL_DISPLAY_NAME_MR=वैनतेय प्राथमिक विद्या मंदिर
VITE_SCHOOL_HERO_TITLE_BASE_MR=वैनतेय प्राथमिक
VITE_SCHOOL_HERO_TITLE_ACCENT_MR=विद्या मंदिर
VITE_SCHOOL_SHORT_NAME_MR=वैनतेय
VITE_SCHOOL_TAGLINE_MR=निफाड, नाशिक
VITE_SCHOOL_LOCATION_MR=निफाड, ता. निफाड, जि. नाशिक
VITE_SCHOOL_ADDRESS_MR=वैनतेय प्राथमिक विद्या मंदिर\nनिफाड, ता. निफाड, जि. नाशिक — 422303
VITE_SCHOOL_POSTAL_CODE=422303
VITE_SCHOOL_PHONE_DISPLAY=+९१ २२ २३५६ ६८९०
VITE_SCHOOL_PHONE_TEL=+912223566890
VITE_SCHOOL_EMAIL_GENERAL=info@vainateya.edu
```

**Notes:**
- `.env.local` is git-ignored (created per environment)
- All `VITE_*` variables are embedded in frontend build
- Update `VITE_API_URL` after Render backend is deployed

---

## 3. Update Frontend API Service (if not already done)

**File:** `src/lib/api.ts`

Verify the API base URL is using the environment variable:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Include JWT token in requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## 4. Update `vite.config.ts` (Remove Proxy)

**File:** `vite.config.ts`

Since the backend is now on a separate domain (Render), remove the dev proxy:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    // REMOVED: No longer need proxy since backend is on separate domain
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
  },
}));
```

---

## 5. Environment Variables for Vercel

**In Vercel Dashboard:**

Navigate to: **Settings → Environment Variables**

Add these variables:

| Name | Value | Scope |
|------|-------|-------|
| `VITE_API_URL` | `https://family-hub-backend-xxxxx.onrender.com/api` | Production |
| `VITE_SCHOOL_DISPLAY_NAME_MR` | `वैनतेय प्राथमिक विद्या मंदिर` | Production |
| `VITE_SCHOOL_HERO_TITLE_BASE_MR` | `वैनतेय प्राथमिक` | Production |
| `VITE_SCHOOL_HERO_TITLE_ACCENT_MR` | `विद्या मंदिर` | Production |
| `VITE_SCHOOL_SHORT_NAME_MR` | `वैनतेय` | Production |
| `VITE_SCHOOL_TAGLINE_MR` | `निफाड, नाशिक` | Production |
| `VITE_SCHOOL_LOCATION_MR` | `निफाड, ता. निफाड, जि. नाशिक` | Production |
| `VITE_SCHOOL_ADDRESS_MR` | `वैनतेय प्राथमिक विद्या मंदिर\nनिफाड...` | Production |
| `VITE_SCHOOL_POSTAL_CODE` | `422303` | Production |
| `VITE_SCHOOL_PHONE_DISPLAY` | `+९१ २२ २३५६ ६८९०` | Production |
| `VITE_SCHOOL_PHONE_TEL` | `+912223566890` | Production |
| `VITE_SCHOOL_EMAIL_GENERAL` | `info@vainateya.edu` | Production |

**Steps:**
1. Go to Vercel Dashboard
2. Select your project → Settings
3. Click Environment Variables
4. Add each variable above
5. Set scope to "Production"
6. Click "Save"

---

## 6. Deployment Process

### Step 1: Commit Changes Locally

```bash
git add .env.local vercel.json vite.config.ts src/
git commit -m "Deploy: Configure frontend for Vercel with Render backend"
git push origin main
```

### Step 2: Create Vercel Project (First Time Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Link to Git
# Follow prompts to link GitHub repo
```

### Step 3: Set Environment Variables in Vercel Dashboard

1. Go to your project → Settings → Environment Variables
2. Add all variables from the table above
3. Scope set to "Production"

### Step 4: Trigger Deployment

Either:
- **Automatic:** Push to GitHub (Vercel auto-deploys)
- **Manual:** Run `vercel deploy --prod` in CLI

### Step 5: Monitor Build

- Vercel Dashboard → Deployments
- Wait for build to complete
- Check logs for any errors

---

## Testing After Deployment

### Check Build Output

```bash
# In Vercel Dashboard → Deployments → Select latest

# Look for:
✓ Build completed successfully
✓ Files generated: ...
✓ Ready to go live
```

### Test Frontend in Browser

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Check browser console (F12) for any errors
3. Verify Network tab shows API calls going to Render backend

### Login Test

```
Email: admin@google.com
Password: Admin@123
```

Monitor Network tab:
- POST to `https://your-backend.onrender.com/api/auth/login`
- Response should include JWT token

---

## Build & Performance

### Optimize for Production

**Frontend bundle size:**
```bash
npm run build

# Expected output:
# dist/index.html          2.5 kB
# dist/assets/index.js     250.5 kB (gzipped: 75 kB)
# dist/assets/index.css    45.3 kB (gzipped: 8 kB)
```

**Vercel will:**
- ✅ Auto-minify JavaScript and CSS
- ✅ Optimize images (future: Next.js Image)
- ✅ Enable compression (gzip/brotli)
- ✅ Set proper cache headers
- ✅ Provide CDN distribution globally

---

## Environment Variable Security

⚠️ **Important:** 

- `VITE_*` variables are PUBLIC - they get embedded in the frontend bundle
- ❌ NEVER put secrets (API keys, passwords) in VITE_* variables
- ✅ Only put school branding and public URLs

This is why backend runs separately on Render with its own secure environment.

---

## Troubleshooting

### Build fails with "VITE_API_URL not defined"
→ Add `VITE_API_URL` to Vercel Environment Variables
→ Redeploy after adding variables

### Frontend shows "Cannot reach API"
→ Check Network tab in DevTools
→ Verify `VITE_API_URL` in build matches Render backend URL
→ Test Render backend health: `curl https://your-backend.onrender.com/api/health`

### CSS/Images not loading
→ Check build logs in Vercel dashboard
→ Verify `vite.config.ts` is correct
→ Check if outputDirectory is `dist`

### CORS errors
→ These should be handled on Render backend
→ Check backend CORS config includes your Vercel domain
→ Render needs: `FRONTEND_URL=https://your-app.vercel.app`

### Performance Issues
→ Check Vercel Analytics (Performance tab)
→ Monitor Network tab for slow API calls
→ Check if Render backend might be sleeping (upgrade to Starter plan)

---

## Preview vs Production

Vercel provides two environments:

| Environment | URL | When Built |
|-------------|-----|-----------|
| **Preview** | `https://pr-xxx.your-app.vercel.app` | On PR creation |
| **Production** | `https://your-app.vercel.app` | On push to `main` |

- Preview deploys use same environment variables
- Test in Preview branch before merging to main

---

## Rollback (if needed)

In Vercel Dashboard:
1. Go to Deployments
2. Find previous working deployment
3. Click the three dots (…)
4. Select "Promote to Production"

The previous version will be live immediately.

