#!/usr/bin/env node
/**
 * 🧪 COMPLETE SESSION PERSISTENCE TEST
 *
 * This test simulates the complete flow:
 * 1. Check if user is logged in
 * 2. If not, provide login instructions
 * 3. If yes, test navigation persistence
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

// Test user credentials (you can use these to test)
const TEST_USER = {
  email: 'test.user@skillswap.com',
  password: 'testpassword123'
};

async function completeSessionTest() {
  console.log('🧪 COMPLETE SESSION PERSISTENCE TEST');
  console.log('====================================');
  console.log('Testing login → navigation → session persistence\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  });

  console.log('1. CHECKING CURRENT SESSION STATE');
  console.log('----------------------------------');

  // Check if already logged in
  const { data: currentSession } = await supabase.auth.getSession();

  if (currentSession.session) {
    console.log('✅ Already logged in as:', currentSession.session.user.email);
    console.log('   Token expires:', new Date(currentSession.session.expires_at * 1000));
    await testNavigation(supabase, currentSession.session);
  } else {
    console.log('❌ No active session found');
    await attemptLogin(supabase);
  }
}

async function attemptLogin(supabase) {
  console.log('\n2. ATTEMPTING TEST LOGIN');
  console.log('-------------------------');

  // Try to sign in with test credentials
  console.log(`Attempting login with: ${TEST_USER.email}`);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_USER.email,
    password: TEST_USER.password
  });

  if (error) {
    console.log('❌ Login failed:', error.message);

    if (error.message.includes('Invalid login credentials')) {
      console.log('\n🔧 USER SETUP REQUIRED');
      console.log('The test user does not exist. You have two options:');
      console.log('');
      console.log('OPTION 1: Create test user in browser');
      console.log('1. Visit http://localhost:3002/login');
      console.log('2. Sign up with:', TEST_USER.email);
      console.log('3. Use password:', TEST_USER.password);
      console.log('4. Run this test again');
      console.log('');
      console.log('OPTION 2: Use existing user');
      console.log('1. Log in to the app in your browser');
      console.log('2. Run navigation_session_test.js in browser console');
      console.log('3. Test manual navigation between pages');
      console.log('');
      console.log('OPTION 3: Create user programmatically');
      await attemptSignUp(supabase);
    }
  } else if (data.session) {
    console.log('✅ Login successful!');
    console.log('   User:', data.session.user.email);
    console.log('   Session ID:', data.session.access_token.substring(0, 20) + '...');
    await testNavigation(supabase, data.session);
  } else {
    console.log('⚠️ Login succeeded but no session returned');
  }
}

async function attemptSignUp(supabase) {
  console.log('\n3. ATTEMPTING TO CREATE TEST USER');
  console.log('----------------------------------');

  const { data, error } = await supabase.auth.signUp({
    email: TEST_USER.email,
    password: TEST_USER.password,
    options: {
      data: {
        full_name: 'Test User'
      }
    }
  });

  if (error) {
    console.log('❌ Sign up failed:', error.message);
    console.log('');
    console.log('📋 MANUAL TESTING REQUIRED');
    console.log('Since automated user creation failed, please:');
    console.log('1. Visit http://localhost:3002/login');
    console.log('2. Create an account manually');
    console.log('3. Test navigation between pages');
    console.log('4. Use the browser console test: navigation_session_test.js');
  } else {
    console.log('✅ Test user created successfully!');

    if (data.session) {
      console.log('   Auto-logged in');
      await testNavigation(supabase, data.session);
    } else {
      console.log('   Check email for confirmation (if email confirmation is enabled)');
      console.log('   Then try logging in manually');
    }
  }
}

async function testNavigation(supabase, initialSession) {
  console.log('\n4. TESTING SESSION PERSISTENCE ACROSS NAVIGATION');
  console.log('--------------------------------------------------');

  console.log('Initial session user:', initialSession.user.email);
  console.log('Initial session expires:', new Date(initialSession.expires_at * 1000));

  // Test 1: Create new client instances (simulates page navigation)
  console.log('\nTesting multiple client instances (simulates page loads)...');

  const clientTests = [];

  for (let i = 1; i <= 5; i++) {
    const newClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });

    const { data } = await newClient.auth.getSession();
    clientTests.push({
      client: i,
      hasSession: !!data.session,
      userEmail: data.session?.user?.email,
      sessionId: data.session?.access_token?.substring(0, 10)
    });

    // Small delay to simulate real navigation timing
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\nClient instance results:');
  clientTests.forEach(test => {
    const status = test.hasSession ? '✅' : '❌';
    console.log(`  Client ${test.client}: ${status} ${test.hasSession ? test.userEmail : 'No session'}`);
  });

  // Test 2: Check session consistency
  const allHaveSessions = clientTests.every(t => t.hasSession);
  const uniqueUsers = new Set(clientTests.map(t => t.userEmail)).size;
  const uniqueSessions = new Set(clientTests.map(t => t.sessionId)).size;

  console.log('\nSession consistency analysis:');
  console.log('  All clients have sessions:', allHaveSessions ? '✅ YES' : '❌ NO');
  console.log('  Consistent user across clients:', uniqueUsers <= 1 ? '✅ YES' : '❌ NO');
  console.log('  Same session tokens:', uniqueSessions <= 1 ? '✅ YES' : '❌ NO');

  // Test 3: Token refresh simulation
  console.log('\nTesting token refresh...');

  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.log('❌ Token refresh failed:', error.message);
    } else if (data.session) {
      console.log('✅ Token refresh successful');
      console.log('   New expiry:', new Date(data.session.expires_at * 1000));

      // Test if refreshed session persists
      const afterRefreshClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: refreshedSession } = await afterRefreshClient.auth.getSession();

      console.log('   Session persists after refresh:', refreshedSession.session ? '✅ YES' : '❌ NO');
    }
  } catch (err) {
    console.log('❌ Token refresh error:', err.message);
  }

  // Test 4: Test auth state changes
  console.log('\nTesting auth state change detection...');

  let stateChanges = 0;
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    stateChanges++;
    console.log(`   Auth event ${stateChanges}: ${event} - ${session?.user?.email || 'no session'}`);
  });

  // Trigger a state change by getting session again
  await supabase.auth.getSession();

  // Wait a moment for state changes
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log(`   Total state changes detected: ${stateChanges}`);

  // Cleanup
  listener.subscription.unsubscribe();

  console.log('\n📊 NAVIGATION TEST RESULTS');
  console.log('===========================');

  if (allHaveSessions && uniqueUsers <= 1) {
    console.log('🟢 SESSION PERSISTENCE: WORKING ✅');
    console.log('   Sessions persist correctly across navigation');
    console.log('   No login prompts should occur during normal navigation');
  } else {
    console.log('🔴 SESSION PERSISTENCE: ISSUES DETECTED ❌');
    console.log('   Users may get logged out during navigation');
    console.log('   This explains the production issue you experienced');

    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Check if AuthProvider properly wraps all pages');
    console.log('2. Verify localStorage is accessible and not being cleared');
    console.log('3. Check for race conditions in auth initialization');
    console.log('4. Ensure consistent Supabase client configuration');
    console.log('5. Check for conflicting auth flows (server vs client)');
  }

  console.log('\n🧪 BROWSER TESTING STEPS:');
  console.log('1. Visit http://localhost:3002/login');
  console.log('2. Log in with your account');
  console.log('3. Navigate between /profile, /messages, /sessions');
  console.log('4. Check if you get prompted to login again');
  console.log('5. Open browser dev tools and run navigation_session_test.js');
  console.log('6. Look for the NavigationAuthDebug overlay (top-right corner)');
}

completeSessionTest().catch(console.error);
