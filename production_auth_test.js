/**
 * Comprehensive Production Authentication Test
 * Tests authentication flow in production build
 */

const puppeteer = require('puppeteer');

async function testProductionAuth() {
  console.log('🚀 Starting Production Authentication Test...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // Enable console logging from the page
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`[Browser ${msg.type()}]:`, msg.text());
      }
    });

    // Test 1: Initial load - should show unauthenticated state
    console.log('📝 Test 1: Initial load (unauthenticated state)');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Check if user-only links are hidden
    const profileLinkVisible = await page.$('a[href="/profile"]') !== null;
    const messagesLinkVisible = await page.$('a[href="/messages"]') !== null;
    const creditsLinkVisible = await page.$('a[href="/credits"]') !== null;
    const signInButtonVisible = await page.$('a[href="/login"]') !== null;

    console.log(`  ✓ Profile link hidden: ${!profileLinkVisible}`);
    console.log(`  ✓ Messages link hidden: ${!messagesLinkVisible}`);
    console.log(`  ✓ Credits link hidden: ${!creditsLinkVisible}`);
    console.log(`  ✓ Sign In button visible: ${signInButtonVisible}`);

    if (profileLinkVisible || messagesLinkVisible || creditsLinkVisible) {
      console.log('  ❌ FAIL: User-only links should be hidden when not authenticated');
    } else {
      console.log('  ✅ PASS: User-only links properly hidden');
    }

    // Test 2: Try to access protected page directly
    console.log('\n📝 Test 2: Direct access to protected page');
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle0' });

    // Should redirect to login or show login form
    const currentUrl = page.url();
    const isRedirectedToLogin = currentUrl.includes('/login');
    console.log(`  Current URL: ${currentUrl}`);
    console.log(`  ✓ Redirected to login: ${isRedirectedToLogin}`);

    if (isRedirectedToLogin) {
      console.log('  ✅ PASS: Protected page properly redirects to login');
    } else {
      console.log('  ❌ FAIL: Protected page should redirect to login');
    }

    // Test 3: Login flow
    console.log('\n📝 Test 3: Login flow');
    if (!isRedirectedToLogin) {
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    }

    // Check if login form is present
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"]');

    console.log(`  ✓ Email input present: ${emailInput !== null}`);
    console.log(`  ✓ Password input present: ${passwordInput !== null}`);
    console.log(`  ✓ Login button present: ${loginButton !== null}`);

    if (emailInput && passwordInput && loginButton) {
      console.log('  ✅ PASS: Login form is properly rendered');

      // Test with demo credentials if available
      console.log('  📝 Testing login with demo credentials...');
      await page.type('input[type="email"]', 'demo@example.com');
      await page.type('input[type="password"]', 'demo123');

      // Click login button and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        page.click('button[type="submit"]')
      ]).catch(async () => {
        console.log('  ⚠️  Login may have failed or no navigation occurred');
        await page.screenshot({ path: 'login_attempt.png' });
      });

      // Check if login was successful
      const postLoginUrl = page.url();
      console.log(`  Post-login URL: ${postLoginUrl}`);

      // Look for user-specific elements
      const profileLinkAfterLogin = await page.$('a[href="/profile"]') !== null;
      const signOutButton = await page.$('a[href="/auth/logout"]') !== null;

      console.log(`  ✓ Profile link visible after login: ${profileLinkAfterLogin}`);
      console.log(`  ✓ Sign Out button visible: ${signOutButton}`);

      if (profileLinkAfterLogin && signOutButton) {
        console.log('  ✅ PASS: Login successful, user UI elements visible');

        // Test 4: Navigation to protected pages
        console.log('\n📝 Test 4: Navigation to protected pages after login');

        // Test profile page
        await page.click('a[href="/profile"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const profilePageUrl = page.url();
        console.log(`  Profile page URL: ${profilePageUrl}`);

        // Check if profile page loads without redirect
        const isOnProfilePage = profilePageUrl.includes('/profile') && !profilePageUrl.includes('/login');
        console.log(`  ✓ Profile page accessible: ${isOnProfilePage}`);

        if (isOnProfilePage) {
          console.log('  ✅ PASS: Profile page accessible after login');
        } else {
          console.log('  ❌ FAIL: Profile page should be accessible after login');
        }

        // Test 5: Logout
        console.log('\n📝 Test 5: Logout flow');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

        const signOutButtonExists = await page.$('a[href="/auth/logout"]') !== null;
        if (signOutButtonExists) {
          await page.click('a[href="/auth/logout"]');
          await page.waitForNavigation({ waitUntil: 'networkidle0' });

          // Check if logged out
          const postLogoutUrl = page.url();
          const profileLinkAfterLogout = await page.$('a[href="/profile"]') !== null;
          const signInButtonAfterLogout = await page.$('a[href="/login"]') !== null;

          console.log(`  Post-logout URL: ${postLogoutUrl}`);
          console.log(`  ✓ Profile link hidden after logout: ${!profileLinkAfterLogout}`);
          console.log(`  ✓ Sign In button visible after logout: ${signInButtonAfterLogout}`);

          if (!profileLinkAfterLogout && signInButtonAfterLogout) {
            console.log('  ✅ PASS: Logout successful, UI reset to unauthenticated state');
          } else {
            console.log('  ❌ FAIL: Logout should reset UI to unauthenticated state');
          }
        } else {
          console.log('  ⚠️  Sign Out button not found, skipping logout test');
        }

      } else {
        console.log('  ❌ FAIL: Login appears unsuccessful');
      }
    } else {
      console.log('  ❌ FAIL: Login form is not properly rendered');
    }

    console.log('\n🏁 Production Authentication Test Complete!');
    console.log('\n📸 Taking final screenshot...');
    await page.screenshot({ path: 'final_state.png', fullPage: true });

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
const checkDependencies = () => {
  try {
    require('puppeteer');
    return true;
  } catch (error) {
    console.log('❌ Puppeteer not installed. Installing...');
    return false;
  }
};

if (require.main === module) {
  if (checkDependencies()) {
    testProductionAuth();
  } else {
    console.log('Please install puppeteer first: npm install --save-dev puppeteer');
    console.log('Then run this test again.');
  }
}

module.exports = { testProductionAuth };
