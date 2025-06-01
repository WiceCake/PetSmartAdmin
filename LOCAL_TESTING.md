# Local Testing Guide

This guide explains how to test your built application locally before deploying to Vercel.

## Quick Start

### Option 1: Vite Preview Server (Recommended)
```bash
npm run build
npm run preview
```
- Opens at: `http://localhost:4173/`
- ✅ Proper SPA routing
- ✅ Production-like environment
- ✅ No additional dependencies

### Option 2: Custom Local Server
```bash
npm run build
npm run serve
```
- Opens at: `http://localhost:8080/`
- ✅ Proper SPA routing
- ✅ Uses Node.js built-in modules
- ✅ Works with any live server setup

## Why Your Live Server Failed

The error you encountered happened because:

1. **Absolute vs Relative Paths**: The built `index.html` references assets with absolute paths (`/assets/...`)
2. **SPA Routing**: Single Page Applications need special server configuration to handle client-side routing
3. **MIME Types**: Some servers don't serve JavaScript files with the correct MIME type

## Asset Path Configuration

The project is configured to use:
- **Development**: Relative paths (`./assets/...`) for flexibility
- **Production**: Absolute paths (`/assets/...`) for Vercel deployment

This is handled automatically in `vite.config.ts`:
```javascript
base: mode === 'development' ? './' : '/',
```

## Testing Different Scenarios

### 1. Test Production Build Locally
```bash
# Build for production
npm run build

# Test with Vite preview (recommended)
npm run preview
```

### 2. Test with Custom Server
```bash
# Build for production
npm run build

# Test with custom server
npm run serve
```

### 3. Test Development Mode
```bash
# Run development server
npm run dev
```

## Common Issues and Solutions

### Issue: 404 Errors for Assets
**Cause**: Server not configured for absolute paths
**Solution**: Use `npm run preview` or `npm run serve`

### Issue: Blank Page on Refresh
**Cause**: Server not handling SPA routing
**Solution**: Use servers that fallback to `index.html` for unknown routes

### Issue: MIME Type Errors
**Cause**: Server not serving files with correct content types
**Solution**: Use the provided custom server or Vite preview

## Server Requirements for SPA

Any server hosting your SPA needs to:

1. **Serve Static Files**: Serve files from the `dist` folder
2. **Handle SPA Routing**: Fallback to `index.html` for unknown routes
3. **Correct MIME Types**: Serve `.js` files as `text/javascript`
4. **Asset Paths**: Handle absolute paths starting with `/assets/`

## Deployment Testing Checklist

Before deploying to Vercel:

- [ ] `npm run build` completes successfully
- [ ] `npm run preview` works locally
- [ ] All routes work (try refreshing on different pages)
- [ ] Assets load correctly (check browser network tab)
- [ ] No console errors
- [ ] Environment variables are set in Vercel dashboard

## Environment Variables

For local testing, make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

For Vercel deployment, add these same variables in the Vercel dashboard.

## Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Server Won't Start
```bash
# Check if port is in use
netstat -an | grep :4173
netstat -an | grep :8080

# Use different port
PORT=3001 npm run serve
```

### Assets Not Loading
1. Check browser network tab for 404 errors
2. Verify `dist/assets/` folder exists and contains files
3. Try `npm run preview` instead of custom servers

## Next Steps

Once local testing works:
1. Push code to GitHub
2. Deploy to Vercel
3. Add environment variables in Vercel dashboard
4. Test the deployed application
