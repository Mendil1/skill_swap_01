# AUTHENTICATION PERSISTENCE TEST GUIDE

## Test Credentials

- **Email**: 360z8@ptct.net
- **Password**: 000000

## Test Steps

### 1. Start Production Server

```bash
npm run build && npm run start
```

### 2. Test Authentication Flow

1. **Open browser** and go to `http://localhost:3000`
2. **Navigate to protected route**: `/sessions`
3. **Verify redirect**: Should redirect to `/login?returnUrl=/sessions`
4. **Login with credentials**:
   - Email: `360z8@ptct.net`
   - Password: `000000`
5. **Verify authentication success**: Should redirect back to `/sessions`

### 3. Test Session Persistence

After successful login, test navigation between pages:

1. **Sessions page** (`/sessions`): Should show "✅ Authenticated as: 360z8@ptct.net"
2. **Messages page** (`/messages`): Should show real user data, no login prompt
3. **Profile page** (`/profile`): Should show real user data, no login prompt
4. **Credits page** (`/credits`): Should show real user data, no login prompt

### 4. Test Browser Refresh

1. **Refresh any protected page**: Should stay logged in
2. **Open new tab**: Navigate to `/sessions` - should not prompt for login
3. **Close and reopen browser**: Session should persist (7-day cookie)

## Expected Results ✅

### Success Indicators:

- ✅ **No repeated login prompts** when navigating between pages
- ✅ **Green authentication banners** showing "✅ Authenticated as: 360z8@ptct.net"
- ✅ **Real user data** displayed on all pages
- ✅ **No yellow "Demo Mode" warnings**
- ✅ **Session persistence** through browser refresh and tab changes

### Console Debug Logs:

Look for these logs in browser console:

```
[Supabase Server] sb- cookies: sb-access-token=eyJhbGci..., sb-refresh-token=eyJhbGci...
[Supabase Middleware] Session refreshed for user: [user-id]
[Middleware] Auth cookie present: true
```

## Troubleshooting

### If still seeing "Demo Mode":

1. **Clear browser cookies** completely
2. **Hard refresh** (Ctrl+F5)
3. **Check console** for authentication errors
4. **Verify environment variables** in `.env.local`

### If repeated login prompts:

1. **Check server logs** for cookie/session errors
2. **Verify middleware** is not clearing cookies
3. **Check Network tab** for authentication cookie headers

### If login fails:

1. **Verify credentials** are correct
2. **Check Supabase dashboard** for user existence
3. **Review server logs** for authentication errors

## Debug Commands

### Check current session state:

```javascript
// In browser console
const { createClient } = window.supabase;
const supabase = createClient();
const { data, error } = await supabase.auth.getSession();
console.log("Session:", data.session?.user?.email);
```

### Verify cookies:

```javascript
// In browser console
document.cookie.split(";").filter((c) => c.includes("sb-"));
```

---

## EXPECTED OUTCOME

After successful testing, Mike (360z8@ptct.net) should:

- ✅ Log in once and stay authenticated across all pages
- ✅ See real user data instead of demo mode
- ✅ Navigate seamlessly without repeated login prompts
- ✅ Maintain session through browser refresh and new tabs
