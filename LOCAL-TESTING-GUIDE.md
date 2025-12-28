# Local Testing Guide - School Authentication

## Quick Start Links

### Primary Test URL
**http://localhost:3000/school/claim**

### Test Flow URLs
1. **Claim Page**: http://localhost:3000/school/claim
2. **Verify Page**: http://localhost:3000/school/verify?token=YOUR_TOKEN
3. **Dashboard**: http://localhost:3000/school/dashboard?token=YOUR_TOKEN

## Step-by-Step Testing

### 1. Start Development Server
```bash
npm run dev
# or
yarn dev
```

### 2. Test School Search & Claim
1. Visit: http://localhost:3000/school/claim
2. Search for: "currie" or "mount" 
3. Select a school from results
4. Enter email: `test@example.gov.za`
5. Click "Claim School Access"

### 3. Test Magic Link Verification
- The system will show a magic link in development mode
- Click the magic link or copy/paste into browser
- Should redirect to verification page with success message

### 4. Check for Hydration Errors
- Open browser DevTools (F12)
- Check Console tab for any hydration errors
- Should see no React hydration warnings

## API Testing Scripts

### Quick Backend Test
```bash
node scripts/test-school-auth-flow.js
```

### Hydration Fix Verification
```bash
node scripts/test-hydration-fix.js
```

## Expected Behavior

### ✅ Working Flow
1. Claim page loads without token requirement
2. Search returns school results
3. Magic link generates successfully
4. Verification page loads without hydration errors
5. Success message displays with school details
6. "Continue to Dashboard" button works

### ❌ Issues to Watch For
- Hydration errors in console
- "Event handlers cannot be passed to Client Component props"
- Middleware blocking claim page access
- useSearchParams errors without Suspense

## Test Data Available

The system has 11,816+ schools loaded including:
- MT CURRIE SENIOR SECONDARY SCHOOL
- MOUNT ERNESTINA COMBINED SCHOOL
- MOUNTVIEW SECONDARY SCHOOL
- DRAKONDALE SCHOOL OF THE ARTS

## Troubleshooting

### If Claim Page Won't Load
- Check middleware.js excludes /school/claim
- Verify Next.js dev server is running
- Check for port conflicts (default 3000)

### If Hydration Errors Occur
- Check browser console for specific errors
- Verify Suspense boundary in verify page
- Ensure no server/client component mixing

### If APIs Don't Work
- Check Supabase connection
- Verify environment variables
- Run: `node scripts/test-school-auth-system.js`

## Production Testing
When ready, the same flow works on production:
- Replace localhost:3000 with your Vercel URL
- All functionality should work identically