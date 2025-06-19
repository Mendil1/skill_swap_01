/**
 * Complete Auth State Clear - Server and Client
 * Run this in browser console to clear ALL authentication data
 */

console.log('🧹 COMPLETE AUTH CLEAR - SERVER & CLIENT');
console.log('==========================================');

async function clearAllAuth() {
  console.log('1. Clearing client-side storage...');

  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
      localStorage.removeItem(key);
      console.log(`   Removed localStorage: ${key}`);
    }
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
      sessionStorage.removeItem(key);
      console.log(`   Removed sessionStorage: ${key}`);
    }
  });

  console.log('2. Clearing server-side auth via Supabase...');

  try {
    // Import and use Supabase to sign out properly
    const { createClient } = await import('/src/utils/supabase/client.js');
    const supabase = createClient();

    // Sign out to clear server-side session
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log('   Supabase signOut error:', error);
    } else {
      console.log('   ✅ Supabase signOut successful');
    }
  } catch (error) {
    console.log('   Could not load Supabase client:', error);
  }

  console.log('3. Clearing cookies manually...');

  // Clear cookies more aggressively
  const cookiesToClear = [
    'sb-sogwgxkxuuvvvjbqlcdo-auth-token',
    'sb-sogwgxkxuuvvvjbqlcdo-auth-token.0',
    'sb-sogwgxkxuuvvvjbqlcdo-auth-token.1',
    'sb-sogwgxkxuuvvvjbqlcdo-refresh-token',
    'sb-sogwgxkxuuvvvjbqlcdo-refresh-token.0',
    'sb-sogwgxkxuuvvvjbqlcdo-refresh-token.1'
  ];

  cookiesToClear.forEach(cookieName => {
    // Multiple attempts to clear cookie
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`;
    console.log(`   Attempted to clear cookie: ${cookieName}`);
  });

  console.log('4. Reloading page to reset all states...');
  setTimeout(() => {
    window.location.href = '/';
  }, 2000);

  console.log('✅ Complete auth clear initiated. Page will reload in 2 seconds.');
}

clearAllAuth();
