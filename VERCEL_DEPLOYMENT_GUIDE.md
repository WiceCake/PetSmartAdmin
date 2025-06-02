# 🚀 Vercel Deployment Guide - SPA Routing Fix

This guide explains how to fix the 404 error issue with client-side routing on Vercel for the PetSmart Admin Dashboard.

## 🔍 Problem Description

**Issue:** 404 errors when reloading pages or accessing direct URLs with paths
- ✅ Base URL works: `https://pet-smart-admin.vercel.app/`
- ❌ Routes fail on reload: `https://pet-smart-admin.vercel.app/dashboard` → 404

**Root Cause:** Vercel's server doesn't know how to handle client-side routes and returns 404 instead of serving `index.html`.

## ✅ Solution Implemented

### 1. **Vercel Configuration (`vercel.json`)**

Created optimized `vercel.json` with proper SPA routing configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 2. **Backup Redirects (`public/_redirects`)**

Created fallback redirects file for additional compatibility:

```
# API routes should not be redirected
/api/* /api/:splat 200

# All other routes should serve the index.html for client-side routing
/* /index.html 200
```

### 3. **Routing Test Script**

Added comprehensive testing script to verify routing works correctly:

```bash
npm run test-routing
```

## 🔧 Key Configuration Details

### **Rewrite Rules**
- `"source": "/((?!api/).*)"` - Matches all routes except API routes
- `"destination": "/index.html"` - Serves the main SPA file for all client routes

### **Caching Strategy**
- **Static Assets:** 1 year cache with immutable flag
- **HTML Files:** No cache to ensure fresh content
- **Security Headers:** Added for enhanced security

### **API Route Protection**
- API routes (if any) are excluded from SPA rewrites
- Prevents interference with backend functionality

## 🧪 Testing the Fix

### **Manual Testing**
1. Deploy to Vercel with the new configuration
2. Test these URLs directly in browser:
   - `https://pet-smart-admin.vercel.app/dashboard`
   - `https://pet-smart-admin.vercel.app/users`
   - `https://pet-smart-admin.vercel.app/products`
   - `https://pet-smart-admin.vercel.app/orders`

### **Automated Testing**
Run the routing test script:
```bash
npm run test-routing
```

Expected output:
```
🧪 Testing SPA Routing on Vercel...
📍 Base URL: https://pet-smart-admin.vercel.app
────────────────────────────────────────────────────────────
Route                | Status | HTML | Vue App
────────────────────────────────────────────────────────────
✅ /                  | Status: 200 | HTML: Yes | Vue: Yes
✅ /dashboard         | Status: 200 | HTML: Yes | Vue: Yes
✅ /users             | Status: 200 | HTML: Yes | Vue: Yes
✅ /products          | Status: 200 | HTML: Yes | Vue: Yes
...
────────────────────────────────────────────────────────────
📊 Summary:
✅ Successful: 15/15
🎉 All routes are working correctly!
✅ SPA routing is properly configured on Vercel
```

## 🚀 Deployment Steps

1. **Commit Changes:**
   ```bash
   git add vercel.json public/_redirects scripts/test-routing.js
   git commit -m "fix: Add Vercel SPA routing configuration"
   git push
   ```

2. **Deploy to Vercel:**
   - Vercel will automatically detect the new configuration
   - Build and deployment will use the new settings

3. **Verify Deployment:**
   ```bash
   npm run test-routing
   ```

## ✅ Expected Results

After deployment, users should be able to:
- ✅ Reload any page without 404 errors
- ✅ Share direct links to specific admin pages
- ✅ Navigate normally through the application
- ✅ Bookmark any admin dashboard URL and access it directly
- ✅ Use browser back/forward buttons correctly

## 🔍 Troubleshooting

### **If routes still return 404:**
1. Check Vercel deployment logs
2. Verify `vercel.json` is in the root directory
3. Ensure the build output directory is correct (`dist`)
4. Check for any custom Vercel project settings that might override the configuration

### **If static assets fail to load:**
1. Verify the asset paths in the built application
2. Check the `base` configuration in `vite.config.ts`
3. Ensure asset caching headers are properly set

### **Performance Issues:**
1. Monitor Core Web Vitals in Vercel Analytics
2. Check bundle sizes and optimize if necessary
3. Verify caching headers are working correctly

## 📞 Support

If you encounter any issues:
1. Run `npm run test-routing` to diagnose the problem
2. Check Vercel deployment logs
3. Verify the configuration matches this guide exactly
