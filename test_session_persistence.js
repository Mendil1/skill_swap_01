#!/usr/bin/env node
/**
 * 🍪 SESSION & COOKIE PERSISTENCE TEST
 *
 * Tests the exact issue: losing authentication when navigating between pages
 * This simulates what happens when users navigate in the browser
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

async function testSessionPersistence() {
  console.log('🍪 TESTING SESSION & COOKIE PERSISTENCE');
  console.log('========================================');
  console.log('Simulating page navigation and session persistence\n');

  // Create multiple client instances to simulate page navigation
  const client1 = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const client2 = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const client3 = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('1. TESTING SESSION RETRIEVAL METHODS');
  console.log('-------------------------------------');

  // Test 1: Check current session across different clients
  console.log('Testing getSession() across multiple client instances...');

  try {
    const session1 = await client1.auth.getSession();
    const session2 = await client2.auth.getSession();
    const session3 = await client3.auth.getSession();

    console.log('Client 1 session:', session1.data.session ? '✅ Has session' : '❌ No session');
    console.log('Client 2 session:', session2.data.session ? '✅ Has session' : '❌ No session');
    console.log('Client 3 session:', session3.data.session ? '✅ Has session' : '❌ No session');

    if (session1.data.session) {
      console.log('Session details:');
      console.log('  - User ID:', session1.data.session.user.id);
      console.log('  - Email:', session1.data.session.user.email);
      console.log('  - Expires at:', new Date(session1.data.session.expires_at * 1000));
    }
  } catch (err) {
    console.log('❌ Session check failed:', err.message);
  }

  console.log('\n2. TESTING SESSION PERSISTENCE CONFIGURATION');
  console.log('---------------------------------------------');

  // Test 2: Check auth configuration
  console.log('Checking Supabase client configuration...');

  // Create client with explicit persistence settings
  const persistentClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      storageKey: 'supabase.auth.token',
      storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  try {
    const { data, error } = await persistentClient.auth.getSession();
    console.log('Persistent client session:', data.session ? '✅ Has session' : '❌ No session');
    if (error) console.log('Error:', error.message);
  } catch (err) {
    console.log('❌ Persistent client error:', err.message);
  }

  console.log('\n3. TESTING AUTH STATE CHANGES');
  console.log('------------------------------');

  // Test 3: Listen for auth state changes
  console.log('Setting up auth state listener...');

  let authStateChanges = 0;
  const { data: authListener } = client1.auth.onAuthStateChange((event, session) => {
    authStateChanges++;
    console.log(`Auth state change #${authStateChanges}:`, event);
    if (session) {
      console.log('  Session exists:', session.user.email);
    } else {
      console.log('  No session');
    }
  });

  // Wait a moment for any state changes
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log(`Total auth state changes detected: ${authStateChanges}`);

  console.log('\n4. TESTING CROSS-TAB SESSION SIMULATION');
  console.log('----------------------------------------');

  // Test 4: Simulate what happens when opening new tabs/pages
  console.log('Simulating multiple "pages" (client instances)...');

  const pages = [];
  for (let i = 1; i <= 5; i++) {
    const pageClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data } = await pageClient.auth.getSession();
    pages.push({
      page: i,
      hasSession: !!data.session,
      userId: data.session?.user?.id
    });
  }

  pages.forEach(page => {
    console.log(`Page ${page.page}: ${page.hasSession ? '✅ Authenticated' : '❌ Not authenticated'}`);
  });

  console.log('\n5. TESTING LOCAL STORAGE SIMULATION');
  console.log('------------------------------------');

  // Test 5: Check what would be stored in localStorage
  console.log('Checking auth storage mechanisms...');

  try {
    // Try to get the current session and see what storage keys would be used
    const { data } = await client1.auth.getSession();

    if (data.session) {
      console.log('✅ Session data available for storage');
      console.log('  Access token length:', data.session.access_token.length);
      console.log('  Refresh token length:', data.session.refresh_token.length);
      console.log('  Token expires:', new Date(data.session.expires_at * 1000));

      // Check if tokens are valid
      const tokenValid = data.session.expires_at * 1000 > Date.now();
      console.log('  Token valid:', tokenValid ? '✅ Yes' : '❌ Expired');
    } else {
      console.log('❌ No session data to store');
    }
  } catch (err) {
    console.log('❌ Storage check failed:', err.message);
  }

  console.log('\n6. TESTING AUTOMATIC TOKEN REFRESH');
  console.log('-----------------------------------');

  // Test 6: Check if tokens can be refreshed
  console.log('Testing token refresh mechanism...');

  try {
    const { data, error } = await client1.auth.refreshSession();

    if (error) {
      console.log('❌ Token refresh failed:', error.message);

      // Common refresh issues
      if (error.message.includes('Invalid Refresh Token')) {
        console.log('🔍 Issue: Refresh token is invalid or expired');
        console.log('   This could cause logout on page navigation');
      }
    } else if (data.session) {
      console.log('✅ Token refresh successful');
      console.log('  New token expires:', new Date(data.session.expires_at * 1000));
    } else {
      console.log('⚠️ Refresh returned no session');
    }
  } catch (err) {
    console.log('❌ Refresh test failed:', err.message);
  }

  // Cleanup
  authListener.subscription.unsubscribe();

  console.log('\n📋 SESSION PERSISTENCE DIAGNOSIS');
  console.log('=================================');

  const currentSession = await client1.auth.getSession();

  if (!currentSession.data.session) {
    console.log('🔴 CRITICAL ISSUE: No active session found');
    console.log('');
    console.log('POSSIBLE CAUSES:');
    console.log('1. User is not logged in');
    console.log('2. Session expired');
    console.log('3. Auth configuration issue');
    console.log('4. localStorage/cookies being cleared');
    console.log('');
    console.log('NEXT STEPS:');
    console.log('1. Log in to the app first');
    console.log('2. Run this test again');
    console.log('3. Check browser dev tools for auth cookies');
    console.log('4. Check auth-provider.tsx configuration');
  } else {
    console.log('🟢 Session exists - checking for navigation issues...');
    console.log('');
    console.log('POTENTIAL NAVIGATION ISSUES:');
    console.log('1. Auth provider not wrapping all pages');
    console.log('2. Session not being persisted in localStorage');
    console.log('3. Auth state not being restored on page load');
    console.log('4. Race conditions in auth initialization');
    console.log('');
    console.log('RECOMMENDED CHECKS:');
    console.log('1. Verify auth-provider.tsx is in layout.tsx');
    console.log('2. Check if useAuth() is used correctly in pages');
    console.log('3. Test manual navigation between /profile, /messages, /sessions');
    console.log('4. Check browser network tab for auth API calls');
  }
}

testSessionPersistence().catch(console.error);
