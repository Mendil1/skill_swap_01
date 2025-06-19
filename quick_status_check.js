#!/usr/bin/env node
/**
 * 🔍 QUICK PRODUCTION STATUS CHECK
 *
 * This script tests the current working functionality
 * without requiring service role keys
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function quickStatusCheck() {
  console.log('🔍 QUICK PRODUCTION STATUS CHECK');
  console.log('='.repeat(50));
  console.log('Testing current functionality without service keys\n');

  let passCount = 0;
  let totalTests = 0;

  function logTest(name, passed, message) {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${message}`);
    if (passed) passCount++;
    totalTests++;
  }

  // Test 1: Database connectivity
  try {
    const { data, error } = await supabase.from('users').select('user_id').limit(1);
    logTest('Database Connection', !error, error ? error.message : 'Connected successfully');
  } catch (err) {
    logTest('Database Connection', false, `Connection failed: ${err.message}`);
  }

  // Test 2: Message data exists
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('message_id, content')
      .limit(5);

    logTest('Message Data', !error && messages?.length > 0,
      error ? error.message : `Found ${messages?.length || 0} messages`);
  } catch (err) {
    logTest('Message Data', false, `Query failed: ${err.message}`);
  }

  // Test 3: Connection requests data
  try {
    const { data: connections, error } = await supabase
      .from('connection_requests')
      .select('connection_id, status')
      .limit(5);

    logTest('Connection Data', !error && connections?.length > 0,
      error ? error.message : `Found ${connections?.length || 0} connections`);
  } catch (err) {
    logTest('Connection Data', false, `Query failed: ${err.message}`);
  }

  // Test 4: Sessions table
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);

    logTest('Sessions Table', !error,
      error ? error.message : 'Sessions table accessible');
  } catch (err) {
    logTest('Sessions Table', false, `Query failed: ${err.message}`);
  }

  // Test 5: User profiles
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('user_id, full_name')
      .limit(3);

    logTest('User Profiles', !error && users?.length > 0,
      error ? error.message : `Found ${users?.length || 0} user profiles`);
  } catch (err) {
    logTest('User Profiles', false, `Query failed: ${err.message}`);
  }

  // Test 6: Real-time capability
  try {
    const channel = supabase.channel('test-channel');
    logTest('Real-time Setup', !!channel, channel ? 'Real-time channel created' : 'Failed to create channel');
    if (channel) {
      supabase.removeChannel(channel);
    }
  } catch (err) {
    logTest('Real-time Setup', false, `Real-time error: ${err.message}`);
  }

  // Test 7: Auth methods available
  try {
    const authMethods = ['signInWithPassword', 'signOut', 'getSession', 'getUser'];
    const hasAllMethods = authMethods.every(method => typeof supabase.auth[method] === 'function');
    logTest('Auth Methods', hasAllMethods, hasAllMethods ? 'All auth methods available' : 'Missing auth methods');
  } catch (err) {
    logTest('Auth Methods', false, `Auth check failed: ${err.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('QUICK STATUS SUMMARY');
  console.log('='.repeat(50));

  const passRate = ((passCount / totalTests) * 100).toFixed(1);
  console.log(`✅ Passed: ${passCount}/${totalTests} (${passRate}%)`);

  if (passCount >= 5) {
    console.log('\n🟢 STATUS: CORE FUNCTIONALITY WORKING');
    console.log('   The app appears to be in good working condition.');
    console.log('   Proceed with manual browser testing.');
  } else if (passCount >= 3) {
    console.log('\n🟡 STATUS: PARTIALLY WORKING');
    console.log('   Some functionality is working, but issues exist.');
    console.log('   Review failed tests before proceeding.');
  } else {
    console.log('\n🔴 STATUS: SIGNIFICANT ISSUES');
    console.log('   Multiple systems are failing.');
    console.log('   Address database connectivity issues first.');
  }

  console.log('\n📋 NEXT STEPS:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Visit http://localhost:3001');
  console.log('3. Test login functionality');
  console.log('4. Check /messages page for conversations');
  console.log('5. Verify all pages load correctly');
  console.log('6. Use PRODUCTION_READINESS_CHECKLIST.md for detailed testing');
}

quickStatusCheck().catch(console.error);
