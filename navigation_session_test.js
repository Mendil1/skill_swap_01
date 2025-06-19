/**
 * 🔍 NAVIGATION SESSION PERSISTENCE TEST
 *
 * Run this in the browser console at http://localhost:3002
 * This tests the exact issue: session persistence during navigation
 */

window.testSessionPersistence = async function() {
  console.log('🔍 TESTING SESSION PERSISTENCE DURING NAVIGATION');
  console.log('================================================');

  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  function logResult(test, success, message) {
    testResults.total++;
    if (success) {
      testResults.passed++;
      console.log(`✅ ${test}: ${message}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${test}: ${message}`);
    }
  }

  // Test 1: Check current authentication state
  console.log('\n1. CHECKING CURRENT AUTH STATE');
  console.log('-------------------------------');

  // Check if we can access auth context
  try {
    const authContextExists = window.React && document.querySelector('[data-testid="auth-provider"]');
    logResult('Auth Context', !!authContextExists, authContextExists ? 'Available' : 'Check if AuthProvider is mounted');
  } catch (err) {
    logResult('Auth Context', false, 'Error accessing auth context');
  }

  // Check localStorage for session data
  try {
    const supabaseSession = localStorage.getItem('supabase.auth.token');
    const hasStoredSession = !!supabaseSession;
    logResult('LocalStorage Session', hasStoredSession, hasStoredSession ? 'Session data found' : 'No session in localStorage');

    if (hasStoredSession) {
      try {
        const sessionData = JSON.parse(supabaseSession);
        const expires = new Date(sessionData.expires_at * 1000);
        const isExpired = expires < new Date();
        logResult('Session Validity', !isExpired, isExpired ? 'Session expired' : `Valid until ${expires.toLocaleString()}`);
      } catch (parseErr) {
        logResult('Session Parsing', false, 'Could not parse session data');
      }
    }
  } catch (err) {
    logResult('LocalStorage Check', false, 'Error checking localStorage');
  }

  // Check cookies
  try {
    const authCookies = document.cookie.split(';').filter(c => c.trim().startsWith('sb-'));
    logResult('Auth Cookies', authCookies.length > 0, `Found ${authCookies.length} Supabase cookies`);

    authCookies.forEach((cookie, index) => {
      const [name] = cookie.trim().split('=');
      console.log(`   Cookie ${index + 1}: ${name}`);
    });
  } catch (err) {
    logResult('Cookie Check', false, 'Error checking cookies');
  }

  // Test 2: Test Supabase client session
  console.log('\n2. TESTING SUPABASE CLIENT SESSION');
  console.log('-----------------------------------');

  try {
    // Access the global Supabase client if available
    if (window.supabase) {
      const { data, error } = await window.supabase.auth.getSession();
      logResult('Supabase Session', !!data.session && !error,
        data.session ? `Logged in as ${data.session.user.email}` : 'No active session');
    } else {
      // Try to create a new client
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
      );

      const { data, error } = await supabase.auth.getSession();
      logResult('Fresh Client Session', !!data.session && !error,
        data.session ? `Session exists for ${data.session.user.email}` : 'No session found');
    }
  } catch (err) {
    logResult('Supabase Client Test', false, `Error: ${err.message}`);
  }

  // Test 3: Simulate page navigation
  console.log('\n3. SIMULATING PAGE NAVIGATION');
  console.log('------------------------------');

  const currentUrl = window.location.href;
  console.log('Current URL:', currentUrl);

  // Test if we can navigate without losing auth
  const testUrls = ['/profile', '/messages', '/sessions', '/'];

  for (const url of testUrls) {
    try {
      // Check if the page would be accessible
      const response = await fetch(url, { credentials: 'include' });
      logResult(`Page Access: ${url}`, response.ok, `Status: ${response.status}`);
    } catch (err) {
      logResult(`Page Access: ${url}`, false, `Error: ${err.message}`);
    }
  }

  // Test 4: Auth state persistence across client creation
  console.log('\n4. TESTING AUTH PERSISTENCE ACROSS CLIENT INSTANCES');
  console.log('----------------------------------------------------');

  try {
    // Create multiple client instances (simulates new page loads)
    const clientTests = [];

    for (let i = 1; i <= 3; i++) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const testClient = createClient(
          'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs',
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true
            }
          }
        );

        const { data } = await testClient.auth.getSession();
        clientTests.push({
          client: i,
          hasSession: !!data.session,
          user: data.session?.user?.email
        });
      } catch (err) {
        clientTests.push({
          client: i,
          hasSession: false,
          error: err.message
        });
      }
    }

    clientTests.forEach(test => {
      logResult(`Client ${test.client} Session`, test.hasSession,
        test.hasSession ? `User: ${test.user}` : (test.error || 'No session'));
    });

    // Check consistency
    const allHaveSessions = clientTests.every(t => t.hasSession);
    const allHaveSameUser = new Set(clientTests.map(t => t.user)).size <= 1;

    logResult('Session Consistency', allHaveSessions && allHaveSameUser,
      allHaveSessions ? 'All clients have consistent sessions' : 'Session inconsistency detected');

  } catch (err) {
    logResult('Client Instance Test', false, `Error: ${err.message}`);
  }

  // Test 5: Check for common session issues
  console.log('\n5. CHECKING FOR COMMON SESSION ISSUES');
  console.log('--------------------------------------');

  // Check for PKCE flow
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const hasCode = urlParams.has('code');
    const hasError = urlParams.has('error');

    if (hasCode) {
      logResult('PKCE Flow', true, 'Auth code present in URL - should be handled');
    } else if (hasError) {
      logResult('PKCE Flow', false, `Auth error in URL: ${urlParams.get('error')}`);
    } else {
      logResult('PKCE Flow', true, 'No auth parameters in URL - normal state');
    }
  } catch (err) {
    logResult('PKCE Check', false, `Error: ${err.message}`);
  }

  // Check for storage issues
  try {
    const canWriteStorage = (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })();

    logResult('LocalStorage Access', canWriteStorage, canWriteStorage ? 'Working' : 'Blocked or unavailable');
  } catch (err) {
    logResult('Storage Check', false, `Error: ${err.message}`);
  }

  // Final Results
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Passed: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ Failed: ${testResults.failed}/${testResults.total}`);
  console.log(`📊 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);

  if (testResults.failed > 0) {
    console.log('\n🔧 POTENTIAL ISSUES DETECTED:');
    console.log('- If no session found: User needs to log in first');
    console.log('- If session inconsistent: Check auth-provider.tsx configuration');
    console.log('- If localStorage blocked: Check browser privacy settings');
    console.log('- If cookies missing: Check Supabase auth configuration');
    console.log('\n🔍 NEXT STEPS:');
    console.log('1. Log in to the application');
    console.log('2. Run this test again');
    console.log('3. Try navigating between pages manually');
    console.log('4. Check browser dev tools for errors');
  } else {
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('Session persistence appears to be working correctly.');
  }

  return testResults;
};

// Auto-run if called directly
if (typeof window !== 'undefined') {
  console.log('🔍 Session Persistence Test loaded!');
  console.log('Run testSessionPersistence() to start testing');
}
