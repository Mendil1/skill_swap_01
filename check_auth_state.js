/**
 * Check Current Auth State - Run this in browser console
 */

console.log('🔍 CURRENT AUTHENTICATION STATE CHECK');
console.log('====================================');

// Check localStorage
console.log('📦 localStorage auth data:');
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
    try {
      const value = localStorage.getItem(key);
      const parsed = JSON.parse(value);
      console.log(`   ${key}:`, parsed);
    } catch (e) {
      console.log(`   ${key}: (raw)`, localStorage.getItem(key));
    }
  }
});

// Check cookies
console.log('\n🍪 Auth cookies:');
const cookies = document.cookie.split(';');
const authCookies = cookies.filter(cookie =>
  cookie.includes('sb-') || cookie.includes('supabase') || cookie.includes('auth')
);
authCookies.forEach(cookie => {
  const [name, value] = cookie.trim().split('=');
  console.log(`   ${name}: ${value ? value.substring(0, 20) + '...' : 'empty'}`);
});

// Check current UI state
console.log('\n🎯 UI State:');
const profileBtn = document.querySelector('a[href="/profile"]');
const signInBtn = document.querySelector('a[href="/login"]');
const signOutBtn = document.querySelector('a[href="/auth/logout"]');

console.log(`   Profile button visible: ${!!profileBtn && profileBtn.offsetParent !== null}`);
console.log(`   Sign In button visible: ${!!signInBtn && signInBtn.offsetParent !== null}`);
console.log(`   Sign Out button visible: ${!!signOutBtn && signOutBtn.offsetParent !== null}`);

// Try to get Supabase session
console.log('\n🔐 Testing Supabase session...');
import('/src/utils/supabase/client.js').then(({ createClient }) => {
  const supabase = createClient();

  supabase.auth.getSession().then(({ data: { session }, error }) => {
    console.log('Session:', session?.user?.email || 'none');
    console.log('Session error:', error);
  });

  supabase.auth.getUser().then(({ data: { user }, error }) => {
    console.log('User:', user?.email || 'none');
    console.log('User error:', error);
  });
}).catch(error => {
  console.log('Could not load Supabase client:', error);
});

console.log('\n✅ Auth state check complete. Look above for details.');
