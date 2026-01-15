# Production Deployment Guide

## Issue Summary
Frontend on Vercel couldn't connect to backend on Render because:
1. Environment variables weren't set in Vercel project settings
2. CORS whitelist had incorrect URL format (with trailing slash)
3. Environment variable not properly passed during build

## Solution Applied

### 1. Frontend Configuration (Vercel)

#### Step 1: Set Environment Variable in Vercel Project
Go to your Vercel project dashboard:
- Navigate to **Settings** → **Environment Variables**
- Add a new variable:
  - Name: `VITE_API_BASE`
  - Value: `https://rabuste-backend-dryi.onrender.com/api`
- Select environments: **Production**, **Preview**, **Development** (check all)
- Click **Save**

#### Step 2: Files Created/Updated
- `.env.production` - Created with production API URL
- `vercel.json` - Updated to include build configuration

#### Step 3: Rebuild and Redeploy
After setting env vars in Vercel dashboard:
```bash
cd frontend
git add .
git commit -m "Fix: Add .env.production and update vercel.json for production deployment"
git push  # This will trigger automatic Vercel redeploy
```

### 2. Backend Configuration (Render)

#### Step 1: Fix CORS Settings
CORS whitelist has been updated to accept:
- `http://localhost:5173` (local dev)
- `http://localhost:3000` (alternative local dev)
- `https://rabustecafe1-cvoionyyj-aayush-097s-projects.vercel.app` (Vercel production, NO trailing slash)

**Deploy backend changes:**
```bash
cd backend
git add .
git commit -m "Fix: Update CORS to accept Vercel frontend URL without trailing slash"
git push  # This will trigger automatic Render redeploy
```

### 3. Verification Steps

#### Local Development
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Should run on http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Should run on http://localhost:5173
```

#### Production (Vercel + Render)
1. After redeploys complete, visit: https://rabustecafe1-cvoionyyj-aayush-097s-projects.vercel.app/
2. Open browser DevTools (F12)
3. Go to **Console** tab - should see NO "Cannot reach Rabuste API" error
4. Go to **Network** tab
5. Navigate a page that loads menu - should see successful requests to `https://rabuste-backend-dryi.onrender.com/api/*`

### 4. Common Issues & Solutions

**Issue: Still seeing "Cannot reach Rabuste API" error**
- Solution: Wait 5 minutes for Vercel/Render to complete redeploy
- Check Vercel project logs for build errors
- Verify `VITE_API_BASE` is set correctly in Vercel Settings (NOT in .env file)

**Issue: 404 errors on API calls**
- Solution: Check network tab in DevTools - verify full URL matches backend routes
- Example correct URL: `https://rabuste-backend-dryi.onrender.com/api/coffee`

**Issue: CORS error in console**
- Solution: Verify Vercel frontend URL matches CORS whitelist in backend/src/server.js
- Remember: NO trailing slash in CORS whitelist URLs

**Issue: Render backend going to sleep**
- Render free tier spins down after 15 min of inactivity
- First request will be slow (30+ seconds) as it wakes up
- Consider upgrading to paid tier for production

### 5. Environment Variable Summary

| Environment | Variable Name | Value |
|------------|---------------|-------|
| Vercel Project Settings | `VITE_API_BASE` | `https://rabuste-backend-dryi.onrender.com/api` |
| `.env.production` | `VITE_API_BASE` | `https://rabuste-backend-dryi.onrender.com/api` |
| Backend CORS | N/A | Frontend: `https://rabustecafe1-cvoionyyj-aayush-097s-projects.vercel.app` |

### 6. API Routes

All API routes now use the axios instance configured with `VITE_API_BASE`:
- Auth: `/api/auth/login`, `/api/auth/signup`
- Menu: `/api/menu`, `/api/coffee`, `/api/art`, etc.
- Admin: `/api/admin/menu`, `/api/admin/orders`, etc.
- Debug: `/debug/menu-full` (accessible at base URL)

### 7. Deployment Checklist

- [ ] Set `VITE_API_BASE` environment variable in Vercel project settings
- [ ] Create `.env.production` file in frontend root
- [ ] Update CORS whitelist in backend with correct Vercel URL (no trailing slash)
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render
- [ ] Wait 5 minutes for deployments to complete
- [ ] Test in browser console - no connection errors
- [ ] Test network requests - all API calls successful

