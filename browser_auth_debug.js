/**
 * Browser Authentication Test
 *
 * Copy and paste this into your browser's developer console
 * while on the SkillSwap application to debug authentication issues.
 */

console.log('🔍 SkillSwap Browser Auth Debug');
console.log('==============================');

// Check if we're on the right domain
if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('skillswap')) {
  console.warn('⚠️ This debug script is designed for SkillSwap application');
}

// Test 1: Check localStorage for auth data
console.log('\n📦 Checking localStorage...');
const authKeys = Object.keys(localStorage).filter(key =>
  key.includes('auth') || key.includes('supabase') || key.includes('token')
);

if (authKeys.length > 0) {
  console.log('✅ Auth-related localStorage keys found:', authKeys);
  authKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        console.log(`   ${key}:`, parsed);
      }
    } catch (e) {
      console.log(`   ${key}: (raw)`, localStorage.getItem(key));
    }
  });
} else {
  console.log('❌ No auth-related localStorage found');
}

// Test 2: Check sessionStorage
console.log('\n📝 Checking sessionStorage...');
const sessionAuthKeys = Object.keys(sessionStorage).filter(key =>
  key.includes('auth') || key.includes('supabase') || key.includes('token')
);

if (sessionAuthKeys.length > 0) {
  console.log('✅ Auth-related sessionStorage keys found:', sessionAuthKeys);
} else {
  console.log('❌ No auth-related sessionStorage found');
}

// Test 3: Check cookies
console.log('\n🍪 Checking cookies...');
const authCookies = document.cookie.split(';').filter(cookie =>
  cookie.includes('auth') || cookie.includes('supabase') || cookie.includes('token')
);

if (authCookies.length > 0) {
  console.log('✅ Auth-related cookies found:', authCookies);
} else {
  console.log('❌ No auth-related cookies found');
}

// Test 4: Check if AuthProvider context is available
console.log('\n🔄 Checking AuthProvider state...');
try {
  // This will work if we're on a page with the auth provider
  if (window.React && window.React.version) {
    console.log('✅ React detected, version:', window.React.version);
  }

  // Check if there's a user state in the DOM/React
  const profileButton = document.querySelector('a[href="/profile"]');
  const signInButton = document.querySelector('a[href="/login"]');

  if (profileButton && !signInButton) {
    console.log('✅ Profile button visible, Sign In hidden - likely authenticated');
  } else if (signInButton && !profileButton) {
    console.log('❌ Sign In button visible, Profile hidden - likely not authenticated');
  } else if (profileButton && signInButton) {
    console.log('⚠️ Both buttons visible - potential UI issue');
  } else {
    console.log('❓ Neither button found - check navigation structure');
  }
} catch (e) {
  console.log('❌ Error checking AuthProvider state:', e.message);
}

// Test 5: Test auth sync endpoint
console.log('\n🌐 Testing auth sync endpoint...');
fetch('/auth/sync-session', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
})
.then(response => {
  console.log('   Sync response status:', response.status);
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`HTTP ${response.status}`);
  }
})
.then(data => {
  console.log('✅ Sync endpoint successful');
  console.log('   Access token present:', !!data.access_token);
  console.log('   Refresh token present:', !!data.refresh_token);
  console.log('   User email:', data.user?.email);
})
.catch(error => {
  console.log('❌ Sync endpoint failed:', error.message);
});

// Test 6: Manual auth check function
window.debugAuth = async function() {
  console.log('\n🔧 Manual auth check...');

  try {
    // Try to get the Supabase client from the global scope or create one
    if (window.supabase) {
      const { data, error } = await window.supabase.auth.getSession();
      if (error) {
        console.log('❌ Session check error:', error.message);
      } else {
        console.log('✅ Session check successful');
        console.log('   Has session:', !!data.session);
        console.log('   User email:', data.session?.user?.email);
      }
    } else {
      console.log('❌ Supabase client not available in global scope');
      console.log('   Try running this on a page with the auth provider loaded');
    }
  } catch (e) {
    console.log('❌ Manual auth check error:', e.message);
  }
};

console.log('\n✨ Debug complete! Run debugAuth() for manual auth check');

// Summary
console.log('\n📋 Quick Summary');
console.log('================');
console.log('localStorage auth data:', authKeys.length > 0 ? '✅' : '❌');
console.log('Cookies:', authCookies.length > 0 ? '✅' : '❌');
console.log('Navigation state:', profileButton && !signInButton ? '✅ Authenticated' : '❌ Not authenticated');
