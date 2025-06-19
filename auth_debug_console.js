/**
 * Auth Debug Test - Run this in browser console on any page
 */

console.log('🔍 COMPREHENSIVE AUTH DEBUG');
console.log('============================');

// Check Supabase client
async function testSupabaseAuth() {
  try {
    console.log('\n📡 Testing Supabase Auth...');

    // Import the client
    const { createClient } = await import('/src/utils/supabase/client.js');
    const supabase = createClient();

    console.log('✅ Supabase client created');

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session?.user?.email || 'None');
    console.log('Session error:', sessionError);

    // Get user (more secure)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('User:', user?.email || 'None');
    console.log('User error:', userError);

    return { session, user };

  } catch (error) {
    console.log('❌ Supabase error:', error);
    return null;
  }
}

// Test the auth provider state
if (window.React) {
  console.log('✅ React available');

  // Check localStorage
  const authKeys = Object.keys(localStorage).filter(key =>
    key.includes('supabase') || key.includes('auth')
  );

  console.log('\n📦 localStorage auth keys:', authKeys);
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

  // Check what the auth provider thinks
  console.log('\n🔄 Current UI state:');
  const profileBtn = document.querySelector('a[href="/profile"]');
  const signInBtn = document.querySelector('a[href="/login"]');
  const signOutBtn = document.querySelector('a[href="/auth/logout"]');
  const messagesLink = document.querySelector('a[href="/messages"]');
  const creditsLink = document.querySelector('a[href="/credits"]');

  console.log('Profile button visible:', !!profileBtn);
  console.log('Sign In button visible:', !!signInBtn);
  console.log('Sign Out button visible:', !!signOutBtn);
  console.log('Messages link visible:', !!messagesLink);
  console.log('Credits link visible:', !!creditsLink);

  // Analyze the state
  const isAuthenticated = profileBtn && signOutBtn && !signInBtn;
  const isUnauthenticated = !profileBtn && !signOutBtn && signInBtn;

  console.log('\n🎯 Detected auth state:');
  if (isAuthenticated) {
    console.log('   ✅ UI shows AUTHENTICATED');
  } else if (isUnauthenticated) {
    console.log('   ❌ UI shows UNAUTHENTICATED');
  } else {
    console.log('   ⚠️  UI shows INCONSISTENT state');
  }

  // Test Supabase auth
  testSupabaseAuth();

} else {
  console.log('❌ React not available');
}

// Clear all auth data to test
window.clearAuthData = function() {
  console.log('🧹 Clearing all auth data...');

  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      localStorage.removeItem(key);
      console.log('Removed localStorage:', key);
    }
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      sessionStorage.removeItem(key);
      console.log('Removed sessionStorage:', key);
    }
  });

  console.log('✅ Auth data cleared. Refresh the page.');
};

console.log('Run clearAuthData() to clear all auth data and test clean state');
