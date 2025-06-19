# Production Authentication Test Guide

## Quick Manual Test Steps

### 1. Build for Production
```bash
npm run build
npm start
```

### 2. Test Unauthenticated State
- Visit http://localhost:3000
- ✅ User-only links (Profile, Messages, Credits) should be HIDDEN
- ✅ Sign In button should be VISIBLE
- ✅ Only public links (Explore Skills, How It Works, Sessions) should show

### 3. Test Protected Page Access
- Try to visit http://localhost:3000/profile directly
- ✅ Should redirect to /login with returnUrl parameter
- Try to visit http://localhost:3000/messages directly  
- ✅ Should redirect to /login
- Try to visit http://localhost:3000/credits directly
- ✅ Should redirect to /login

### 4. Test Login Flow
- Go to http://localhost:3000/login
- ✅ Login form should be visible
- Enter credentials and submit
- ✅ Should redirect to homepage or returnUrl
- ✅ User-only links should now be VISIBLE
- ✅ Sign Out button should be VISIBLE
- ✅ Sign In button should be HIDDEN

### 5. Test Navigation After Login
- Click Profile link
- ✅ Should load profile page with user data (not demo data)
- Click Messages link  
- ✅ Should load messages page with user conversations
- Click Credits link
- ✅ Should load credits page with user credit balance

### 6. Test Logout
- Click Sign Out button
- ✅ Should redirect to homepage
- ✅ User-only links should be HIDDEN again
- ✅ Sign In button should be VISIBLE again

## Expected Behavior
- Authentication state should persist across page refreshes
- No demo/test data should appear for authenticated users
- No authentication loops or repeated login prompts
- Fast UI updates when auth state changes
- Proper conditional rendering in navigation

## Common Issues to Watch For
- Demo data showing instead of real user data
- User-only links visible when not authenticated
- Redirects to login on every page load
- Slow auth state updates
- Console errors related to auth
