/**
 * Simple Browser Auth Test - Manual Steps
 *
 * Run this in browser console to test auth state
 */

function testAuthState() {
  console.log('🔍 Testing Authentication State...\n');

  // Check if we're on the right page
  console.log('📍 Current URL:', window.location.href);

  // Check navigation elements
  const profileLink = document.querySelector('a[href="/profile"]');
  const messagesLink = document.querySelector('a[href="/messages"]');
  const creditsLink = document.querySelector('a[href="/credits"]');
  const signInButton = document.querySelector('a[href="/login"]');
  const signOutButton = document.querySelector('a[href="/auth/logout"]');

  console.log('🔗 Navigation Links:');
  console.log('  Profile Link:', profileLink ? '✅ Visible' : '❌ Hidden');
  console.log('  Messages Link:', messagesLink ? '✅ Visible' : '❌ Hidden');
  console.log('  Credits Link:', creditsLink ? '✅ Visible' : '❌ Hidden');
  console.log('  Sign In Button:', signInButton ? '✅ Visible' : '❌ Hidden');
  console.log('  Sign Out Button:', signOutButton ? '✅ Visible' : '❌ Hidden');

  // Check auth provider state (if available in window)
  if (window.React && window.React.useContext) {
    console.log('\n🔐 Auth Provider State (if accessible):');
    // Note: This might not work due to React dev tools limitations
    console.log('  (Check browser React dev tools for auth context)');
  }

  // Look for auth-related console logs
  console.log('\n📝 Look for [AuthProvider] logs in console...');

  // Check for any error elements
  const errorElements = document.querySelectorAll('[class*="error"], .error');
  if (errorElements.length > 0) {
    console.log('\n⚠️  Found potential error elements:', errorElements.length);
  } else {
    console.log('\n✅ No obvious error elements found');
  }

  // Expected state based on visible elements
  const isAuthenticated = profileLink && signOutButton && !signInButton;
  const isUnauthenticated = !profileLink && !signOutButton && signInButton;

  console.log('\n🎯 Detected Auth State:');
  if (isAuthenticated) {
    console.log('  ✅ AUTHENTICATED - User-only links visible, Sign Out available');
  } else if (isUnauthenticated) {
    console.log('  ❌ UNAUTHENTICATED - Only Sign In button visible');
  } else {
    console.log('  ⚠️  INCONSISTENT - Mixed authentication signals');
    console.log('     This might indicate an auth state issue');
  }

  return {
    url: window.location.href,
    profileLink: !!profileLink,
    messagesLink: !!messagesLink,
    creditsLink: !!creditsLink,
    signInButton: !!signInButton,
    signOutButton: !!signOutButton,
    detectedState: isAuthenticated ? 'authenticated' : isUnauthenticated ? 'unauthenticated' : 'inconsistent'
  };
}

// Auto-run test
console.log('🚀 Running Authentication State Test...');
const result = testAuthState();

// Export for manual use
window.testAuthState = testAuthState;
