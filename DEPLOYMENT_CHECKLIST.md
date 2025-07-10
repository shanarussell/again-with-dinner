# Deployment Checklist

## Before Deploying

### 1. Local Testing
- [ ] Run `npm run build` locally - should complete without errors
- [ ] Test the build locally with `npm run preview` (if available)
- [ ] Check for any console errors in development mode

### 2. Code Quality
- [ ] No unused imports or variables
- [ ] All components have proper error boundaries
- [ ] No infinite loops in useEffect hooks
- [ ] All async operations have proper error handling

### 3. Environment Variables
- [ ] All required environment variables are set in Vercel
- [ ] Supabase URL and keys are correct
- [ ] No hardcoded development URLs

## During Deployment

### 1. Monitor Build
- [ ] Watch Vercel build logs for any errors
- [ ] Check that all assets are being built correctly
- [ ] Verify the build completes successfully

### 2. Post-Deployment Testing
- [ ] Test the live site immediately after deployment
- [ ] Check that the app loads without infinite loading
- [ ] Test authentication flow
- [ ] Test key features (recipe creation, editing, etc.)

## If Loading Issues Occur

### 1. Immediate Actions
- [ ] Check browser console for errors
- [ ] Try hard refresh (Ctrl+F5 or Cmd+Shift+R)
- [ ] Clear browser cache and cookies
- [ ] Test in incognito/private mode

### 2. Debugging Steps
- [ ] Check Vercel function logs
- [ ] Verify Supabase connection
- [ ] Check network tab for failed requests
- [ ] Test on different browsers/devices

### 3. Rollback Plan
- [ ] Revert to previous working deployment if needed
- [ ] Check what changed between deployments
- [ ] Test the rollback deployment

## Prevention Strategies

### 1. Staging Environment
- [ ] Deploy to staging first
- [ ] Test thoroughly before production
- [ ] Use feature flags for major changes

### 2. Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor user experience metrics
- [ ] Set up alerts for critical errors

### 3. Code Practices
- [ ] Use proper loading states
- [ ] Implement error boundaries
- [ ] Add timeout handling for async operations
- [ ] Test edge cases and error scenarios 