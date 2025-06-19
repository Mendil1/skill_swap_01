/**
 * 🌐 BROWSER-BASED PRODUCTION TEST
 *
 * Run this script in the browser console while logged in
 * to test authentication, cookies, and session functionality
 */

window.skillswapProductionTest = async function() {
  console.log('🚀 SKILLSWAP BROWSER PRODUCTION TEST');
  console.log('===================================');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };

  function logTest(name, status, message) {
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${name}: ${message}`);
    results[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++;
  }

  // Test 1: Check if user is authenticated
  try {
    const response = await fetch('/api/auth/user');
    if (response.ok) {
      const userData = await response.json();
      if (userData.user) {
        logTest('Authentication', 'pass', `Logged in as ${userData.user.email}`);
      } else {
        logTest('Authentication', 'fail', 'No authenticated user found');
      }
    } else {
      logTest('Authentication', 'fail', `Auth check failed: ${response.status}`);
    }
  } catch (err) {
    logTest('Authentication', 'fail', `Auth check error: ${err.message}`);
  }

  // Test 2: Check cookies
  const cookies = document.cookie.split(';').map(c => c.trim());
  const authCookies = cookies.filter(c => c.startsWith('sb-'));

  if (authCookies.length > 0) {
    logTest('Session Cookies', 'pass', `Found ${authCookies.length} Supabase cookies`);
  } else {
    logTest('Session Cookies', 'fail', 'No Supabase session cookies found');
  }

  // Test 3: Check localStorage
  const localStorageKeys = Object.keys(localStorage).filter(key =>
    key.includes('supabase') || key.includes('auth')
  );

  if (localStorageKeys.length > 0) {
    logTest('Local Storage', 'pass', `Found ${localStorageKeys.length} auth-related localStorage items`);
  } else {
    logTest('Local Storage', 'warning', 'No auth-related localStorage found');
  }

  // Test 4: Test page navigation
  const currentPath = window.location.pathname;
  const protectedPaths = ['/profile', '/messages', '/sessions', '/notifications'];

  if (protectedPaths.includes(currentPath)) {
    logTest('Protected Route Access', 'pass', `Can access protected route: ${currentPath}`);
  } else {
    logTest('Protected Route Access', 'warning', `Not on a protected route: ${currentPath}`);
  }

  // Test 5: Check if React components are loaded
  const reactElements = document.querySelectorAll('[data-reactroot], [data-testid]');
  if (reactElements.length > 0) {
    logTest('React App Loading', 'pass', 'React components detected');
  } else {
    logTest('React App Loading', 'warning', 'No React components detected');
  }

  // Test 6: Check for JavaScript errors
  const hasErrors = window.skillswapErrors && window.skillswapErrors.length > 0;
  if (!hasErrors) {
    logTest('JavaScript Errors', 'pass', 'No JavaScript errors detected');
  } else {
    logTest('JavaScript Errors', 'fail', `${window.skillswapErrors.length} errors found`);
  }

  // Test 7: Test API connectivity
  try {
    const testResponse = await fetch('/api/health');
    if (testResponse.ok) {
      logTest('API Connectivity', 'pass', 'API endpoints responding');
    } else {
      logTest('API Connectivity', 'warning', `API returned ${testResponse.status}`);
    }
  } catch (err) {
    logTest('API Connectivity', 'fail', `API error: ${err.message}`);
  }

  // Test 8: Performance check
  const performanceEntries = performance.getEntriesByType('navigation');
  if (performanceEntries.length > 0) {
    const loadTime = performanceEntries[0].loadEventEnd - performanceEntries[0].loadEventStart;
    if (loadTime < 3000) {
      logTest('Page Load Performance', 'pass', `Page loaded in ${loadTime.toFixed(0)}ms`);
    } else {
      logTest('Page Load Performance', 'warning', `Page took ${loadTime.toFixed(0)}ms to load`);
    }
  }

  // Generate report
  console.log('\n📊 BROWSER TEST RESULTS:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);

  const total = results.passed + results.failed + results.warnings;
  const passRate = ((results.passed / total) * 100).toFixed(1);
  console.log(`📈 Pass Rate: ${passRate}%`);

  if (results.failed === 0 && results.warnings <= 2) {
    console.log('\n🟢 BROWSER TESTS: READY FOR PRODUCTION');
  } else if (results.failed === 0) {
    console.log('\n🟡 BROWSER TESTS: MOSTLY READY - REVIEW WARNINGS');
  } else {
    console.log('\n🔴 BROWSER TESTS: ISSUES FOUND - NEEDS ATTENTION');
  }

  return results;
};

// Set up error tracking
window.skillswapErrors = [];
window.addEventListener('error', (event) => {
  window.skillswapErrors.push({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    timestamp: Date.now()
  });
});

console.log('🌐 Browser production test loaded!');
console.log('Run window.skillswapProductionTest() to execute tests');
