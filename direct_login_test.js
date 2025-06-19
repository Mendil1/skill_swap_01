/**
 * Direct Supabase Login Test - No module imports needed
 * Run this in browser console on the login page
 */

console.log('🔍 DIRECT SUPABASE LOGIN TEST');
console.log('=============================');

// Test if login form submission works
function testLoginForm() {
  console.log('1. Testing login form submission...');

  // Find the login form
  const form = document.querySelector('form');
  const emailInput = document.querySelector('input[name="email"], input[type="email"]');
  const passwordInput = document.querySelector('input[name="password"], input[type="password"]');
  const submitButton = document.querySelector('button[type="submit"]');

  console.log('Form found:', !!form);
  console.log('Email input found:', !!emailInput);
  console.log('Password input found:', !!passwordInput);
  console.log('Submit button found:', !!submitButton);

  if (form && emailInput && passwordInput && submitButton) {
    console.log('✅ Login form elements are present');

    // Fill in test credentials
    emailInput.value = 'test@example.com';
    passwordInput.value = 'test123';

    console.log('2. Filled in test credentials');
    console.log('3. Click the submit button to test login...');

    // Add event listener to see what happens
    form.addEventListener('submit', (e) => {
      console.log('📝 Form submitted!');
      console.log('Email:', emailInput.value);
      console.log('Password length:', passwordInput.value.length);
    });

    return true;
  } else {
    console.log('❌ Login form is incomplete');
    return false;
  }
}

// Test current auth state
function checkAuthUI() {
  console.log('\n🎯 CHECKING AUTH UI STATE...');

  const signInBtn = document.querySelector('a[href="/login"]');
  const profileBtn = document.querySelector('a[href="/profile"]');
  const signOutBtn = document.querySelector('a[href="/auth/logout"]');

  console.log('Sign In button:', signInBtn ? 'Found' : 'Not found');
  console.log('Profile button:', profileBtn ? 'Found' : 'Not found');
  console.log('Sign Out button:', signOutBtn ? 'Found' : 'Not found');

  // Check visibility
  if (signInBtn) {
    console.log('Sign In visible:', signInBtn.offsetParent !== null);
  }
  if (profileBtn) {
    console.log('Profile visible:', profileBtn.offsetParent !== null);
  }
  if (signOutBtn) {
    console.log('Sign Out visible:', signOutBtn.offsetParent !== null);
  }
}

// Check for server-side cookies issue
function checkCookieIssue() {
  console.log('\n🍪 CHECKING COOKIE ISSUE...');

  const cookies = document.cookie;
  console.log('All cookies:', cookies);

  const hasSbCookies = cookies.includes('sb-');
  console.log('Has Supabase cookies:', hasSbCookies);

  if (hasSbCookies) {
    console.log('⚠️  Server-side cookies still exist!');
    console.log('💡 Try visiting: /auth/force-logout');
  } else {
    console.log('✅ No auth cookies found');
  }
}

// Manual form submission test
function manualLoginTest() {
  console.log('\n🧪 MANUAL LOGIN TEST...');

  // Create a test form submission
  const form = document.querySelector('form');
  if (form) {
    const formData = new FormData(form);

    // Set test credentials
    formData.set('email', 'test@example.com');
    formData.set('password', 'test123');

    console.log('Form data prepared:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${key === 'password' ? '[hidden]' : value}`);
    }

    console.log('📝 Now try submitting the form manually');
  }
}

// Run all tests
console.log('🚀 Running all tests...\n');
checkAuthUI();
checkCookieIssue();
testLoginForm();
manualLoginTest();

console.log('\n📋 NEXT STEPS:');
console.log('1. If server cookies exist: Visit /auth/force-logout');
console.log('2. Fill login form with test credentials');
console.log('3. Click submit and watch console for errors');
console.log('4. Check Network tab for failed requests');

// Export functions for manual use
window.testLoginForm = testLoginForm;
window.checkAuthUI = checkAuthUI;
window.checkCookieIssue = checkCookieIssue;
