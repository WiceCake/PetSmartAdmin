# Deployment Guide for PetSmart Admin Dashboard

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Supabase project with the required environment variables

### Environment Variables Setup

1. **In your Vercel project dashboard:**
   - Go to Project Settings → Environment Variables
   - Add the following variables:

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   VITE_APP_TITLE=PetSmart Admin Dashboard
   VITE_APP_VERSION=1.0.0
   ```

2. **Get Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the Project URL and Project API keys

### Build Configuration

The project includes a `vercel.json` configuration file that:
- Sets the correct build command (`npm run build`)
- Configures output directory (`dist`)
- Sets up proper caching headers
- Handles SPA routing with rewrites

### Deployment Steps

1. **Connect Repository:**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Import your GitHub repository in Vercel
   - Vercel will automatically detect it's a Vite project
   - Add the environment variables in Project Settings
   - Deploy

3. **Verify Deployment:**
   - Check that the build completes successfully
   - Test the deployed application
   - Verify Supabase connection works

### Troubleshooting

#### Common Issues:

1. **"Cannot access 'O' before initialization" Error:**
   - This has been fixed with lazy initialization in the Supabase config
   - Ensure all environment variables are properly set in Vercel

2. **Environment Variables Not Found:**
   - Double-check variable names in Vercel dashboard
   - Ensure they start with `VITE_` prefix
   - Redeploy after adding variables

3. **Build Failures:**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility (>=18.0.0)

4. **Supabase Connection Issues:**
   - Verify Supabase URL and keys are correct
   - Check Supabase project is active
   - Ensure RLS policies allow admin access

### Performance Optimization

The build configuration includes:
- Code splitting by feature areas
- Vendor chunk optimization
- Asset caching headers
- Source maps for debugging

### Security Notes

- Service role key is used for admin operations
- Never expose service role key in client-side code
- Environment variables are properly scoped with VITE_ prefix
- All Supabase operations use proper authentication

### Monitoring

After deployment:
- Monitor Vercel analytics for performance
- Check Supabase logs for database operations
- Set up error tracking if needed
- Monitor build times and bundle sizes
