# 🚀 **Production Authentication Setup Guide**

## **🔧 Supabase Dashboard Configuration**

### **Step 1: Access Your Dashboard**

1. Go to: `https://supabase.com/dashboard/project/sogwgxkxuuvvvjbqlcdo`
2. Sign in with your Supabase account

### **Step 2: Configure Site URL**

1. **Navigate:** Settings → Authentication
2. **Scroll to:** "Site URL" section
3. **Current setting should be:** `http://localhost:3000`
4. **For production, change to:** `https://your-production-domain.com`
5. **For development + production, use:** `http://localhost:3000, https://your-production-domain.com`

### **Step 3: Set Redirect URLs**

1. **Still in:** Settings → Authentication
2. **Find:** "Redirect URLs" section
3. **Add these URLs:**
   ```
   http://localhost:3000/**
   https://your-production-domain.com/**
   ```
4. **Make sure to include the `/**` wildcard\*\*

### **Step 4: Configure CORS Origins**

1. **Navigate:** Settings → API
2. **Scroll to:** "CORS origins" section
3. **Add these origins:**
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
4. **No wildcards needed here**

### **Step 5: Verify Auth Providers**

1. **Navigate:** Authentication → Providers
2. **Check Email provider:**
   - ✅ Should be **enabled**
   - ✅ Confirm user can sign up: **enabled**
   - ✅ Email confirmations: configure as needed
3. **For social providers (Google, GitHub, etc.):**
   - Configure redirect URLs to match your domains
   - Update OAuth app settings in the respective platforms

## **🌐 Production Environment Variables**

### **Update Your Production Environment:**

**For Vercel:**

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add/update these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://sogwgxkxuuvvvjbqlcdo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.Ota-G8FGBp2stF5MYapjH947LKFRvGBlhDHcic5VIKc

# 🚨 CRITICAL: Replace with your actual production domain
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com

NEXT_PUBLIC_ENABLE_MESSAGING=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

**For other platforms (Netlify, Railway, etc.):**

- Add the same environment variables in your platform's dashboard
- Make sure `NEXT_PUBLIC_SITE_URL` matches your actual domain

## **🔍 Troubleshooting Common Issues**

### **Issue 1: Redirected to login after successful login**

**Cause:** Site URL mismatch
**Solution:**

1. ✅ Update Site URL in Supabase Dashboard
2. ✅ Add production domain to Redirect URLs
3. ✅ Update `NEXT_PUBLIC_SITE_URL` environment variable

### **Issue 2: Authentication works in dev but not production**

**Cause:** Cookie security settings
**Solution:**

1. ✅ Ensure `secure` flag is set for HTTPS
2. ✅ Check `SameSite=lax` setting
3. ✅ Verify domain configuration

### **Issue 3: Session doesn't persist**

**Cause:** Cookie expiration or storage issues
**Solution:**

1. ✅ Check cookie `maxAge` settings (should be 7 days)
2. ✅ Ensure `httpOnly=false` for auth cookies
3. ✅ Verify path is set to "/"

## **🧪 Quick Testing Steps**

### **1. Test in Browser Console:**

```javascript
// Run this in your production site's browser console
window.diagnoseProd();
```

### **2. Check Network Tab:**

1. Open Developer Tools → Network
2. Try logging in
3. Look for successful auth requests
4. Check cookie headers in responses

### **3. Verify Cookies:**

1. Open Developer Tools → Application → Cookies
2. Look for cookies starting with `sb-` or containing `supabase`
3. Verify they have correct domain and secure flags

## **📋 Quick Checklist**

- [ ] ✅ Site URL updated in Supabase Dashboard
- [ ] ✅ Redirect URLs include production domain
- [ ] ✅ CORS origins include production domain
- [ ] ✅ Email provider is enabled
- [ ] ✅ `NEXT_PUBLIC_SITE_URL` environment variable updated
- [ ] ✅ All environment variables set in production
- [ ] ✅ Test authentication flow in production
- [ ] ✅ Verify session persistence after page refresh

## **🆘 If Still Having Issues**

1. **Check Supabase Auth logs:**

   - Go to Supabase Dashboard → Authentication → Users
   - Look for recent login attempts and errors

2. **Review browser console errors:**

   - Look for CORS errors
   - Check for cookie-related warnings
   - Note any authentication failures

3. **Test with a fresh incognito window:**

   - Clear all cookies and local storage
   - Try the complete login flow

4. **Verify domain configuration:**
   - Ensure your production domain matches exactly
   - Check for www vs non-www mismatches
   - Verify HTTPS is working properly

## **🔑 Example Production URLs**

If your production site is `https://skillswap-app.vercel.app`:

**Supabase Settings:**

- Site URL: `https://skillswap-app.vercel.app`
- Redirect URLs: `https://skillswap-app.vercel.app/**`
- CORS Origins: `https://skillswap-app.vercel.app`

**Environment Variables:**

```bash
NEXT_PUBLIC_SITE_URL=https://skillswap-app.vercel.app
```

**Replace all instances of `your-production-domain.com` with your actual domain!**
