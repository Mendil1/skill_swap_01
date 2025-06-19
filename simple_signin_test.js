/**
 * Simple Sign In Button Diagnostic
 * Copy and paste this into browser console
 */

console.log('🔍 SIGN IN BUTTON DIAGNOSTIC');
console.log('============================');

// Test 1: Check screen size and responsive visibility
const screenWidth = window.innerWidth;
console.log(`📱 Screen width: ${screenWidth}px`);

if (screenWidth >= 768) {
  console.log('📺 Desktop view - checking desktop Sign In button...');

  const desktopSignIn = document.querySelector('a[href="/login"].hidden.md\\:block');
  console.log('Desktop Sign In button:', desktopSignIn ? '✅ Found' : '❌ Not found');

  if (desktopSignIn) {
    console.log('Button text:', desktopSignIn.textContent);
    console.log('Button visible:', desktopSignIn.offsetParent !== null);

    // Test click
    console.log('🖱️  Testing click...');
    desktopSignIn.addEventListener('click', (e) => {
      console.log('✅ Desktop Sign In button clicked!');
      console.log('Navigating to:', e.target.href);
    });
  }
} else {
  console.log('📱 Mobile view - checking mobile Sign In button...');

  // Mobile button is inside a Sheet component, so it might not be visible until the menu is opened
  const mobileMenuTrigger = document.querySelector('button[aria-haspopup="dialog"]');
  console.log('Mobile menu trigger:', mobileMenuTrigger ? '✅ Found' : '❌ Not found');

  if (mobileMenuTrigger) {
    console.log('To access Sign In on mobile, click the menu button first');
  }
}

// Test 2: Check for any Sign In buttons regardless of viewport
const allSignInButtons = Array.from(document.querySelectorAll('a, button'))
  .filter(el => el.textContent && el.textContent.trim() === 'Sign In');

console.log(`\n🔍 All "Sign In" buttons found: ${allSignInButtons.length}`);
allSignInButtons.forEach((btn, index) => {
  console.log(`Button ${index + 1}:`, {
    element: btn,
    href: btn.getAttribute('href'),
    visible: btn.offsetParent !== null,
    classes: btn.className
  });
});

// Test 3: Manual navigation test
window.goToLogin = function() {
  console.log('🚀 Manually navigating to login page...');
  window.location.href = '/login';
};

console.log('\n✅ Diagnostic complete!');
console.log('📝 To manually test navigation, run: goToLogin()');

// Test 4: Check current auth state
const profileBtn = document.querySelector('a[href="/profile"]');
const isAuthenticated = !!profileBtn && profileBtn.offsetParent !== null;
console.log(`\n🔐 Current auth state: ${isAuthenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED'}`);

if (isAuthenticated) {
  console.log('⚠️  User appears to be authenticated - Sign In button should be hidden');
} else {
  console.log('✅ User not authenticated - Sign In button should be visible');
}
