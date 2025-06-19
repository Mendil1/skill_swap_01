/**
 * Debug Sign In Button - Run this in browser console
 */

console.log('🔍 DEBUG: Sign In Button Test');
console.log('==============================');

// Find the Sign In button
const signInButton = document.querySelector('a[href="/login"]');

if (signInButton) {
  console.log('✅ Sign In button found');
  console.log('Button element:', signInButton);
  console.log('Button text:', signInButton.textContent);
  console.log('Button href:', signInButton.getAttribute('href'));
  console.log('Button classes:', signInButton.className);

  // Check if button is visible
  const isVisible = signInButton.offsetParent !== null;
  console.log('Button visible:', isVisible);

  // Check if button is disabled or has any event listeners that might prevent clicking
  const computedStyle = window.getComputedStyle(signInButton);
  console.log('Pointer events:', computedStyle.pointerEvents);
  console.log('Display:', computedStyle.display);
  console.log('Visibility:', computedStyle.visibility);

  // Test clicking the button programmatically
  console.log('\n🖱️  Testing programmatic click...');
  try {
    signInButton.click();
    console.log('✅ Programmatic click successful');
  } catch (error) {
    console.log('❌ Programmatic click failed:', error);
  }

  // Add a test click listener
  signInButton.addEventListener('click', (e) => {
    console.log('🎯 Sign In button clicked!', e);
    console.log('Default prevented:', e.defaultPrevented);
    console.log('Target URL:', e.target.href);
  });

  console.log('\n✅ Click listener added. Try clicking the Sign In button now.');

} else {
  console.log('❌ Sign In button NOT found');

  // Look for any buttons with "Sign In" text
  const allButtons = document.querySelectorAll('button, a');
  const signInButtons = Array.from(allButtons).filter(btn =>
    btn.textContent && btn.textContent.includes('Sign In')
  );

  console.log('All buttons with "Sign In" text:', signInButtons);

  // Check if there are any authentication-related elements
  const authElements = document.querySelectorAll('[class*="auth"], [href*="login"], [href*="signin"]');
  console.log('Auth-related elements:', authElements);
}

// Check current page and auth state
console.log('\n📍 Current page info:');
console.log('URL:', window.location.href);
console.log('Path:', window.location.pathname);

// Check if there are any JavaScript errors
console.log('\n🚨 Check browser console for any JavaScript errors that might prevent navigation');

// Export for manual testing
window.testSignInButton = function() {
  const btn = document.querySelector('a[href="/login"]');
  if (btn) {
    console.log('Clicking Sign In button...');
    btn.click();
  } else {
    console.log('Sign In button not found');
  }
};
