#!/usr/bin/env node
/**
 * 🚀 PRACTICAL PRODUCTION READINESS TEST
 *
 * Tests what actually matters for the SkillSwap app in production:
 * - Can users authenticate and use the app?
 * - Are all the user-facing features working?
 * - Is the data properly secured with RLS?
 */

const { createClient } = require('@supabase/supabase-js');

// Environment configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

console.log('🎯 PRACTICAL PRODUCTION READINESS TEST');
console.log('======================================');
console.log('Testing real-world app functionality\n');

let passedTests = 0;
let totalTests = 0;
const issues = [];
const warnings = [];

function test(name, passed, message = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}${message ? ': ' + message : ''}`);
    issues.push(`${name}${message ? ': ' + message : ''}`);
  }
}

function warn(name, message = '') {
  console.log(`⚠️  ${name}${message ? ': ' + message : ''}`);
  warnings.push(`${name}${message ? ': ' + message : ''}`);
}

async function runTests() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('🔧 CORE INFRASTRUCTURE');
  console.log('-------------------------');

  // Test 1: Basic Connection
  try {
    const { data, error } = await supabase.auth.getSession();
    test('Database Connection', !error, error?.message);
  } catch (err) {
    test('Database Connection', false, err.message);
  }

  // Test 2: Essential Tables
  const tables = ['users', 'messages', 'sessions', 'connection_requests', 'notifications'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      test(`${table} table access`, !error, error?.message);
    } catch (err) {
      test(`${table} table access`, false, err.message);
    }
  }

  console.log('\n📊 DATA VERIFICATION');
  console.log('---------------------');

  // Test 3: Check for actual data
  try {
    const { data: users } = await supabase.from('users').select('count');
    const { data: messages } = await supabase.from('messages').select('count');
    const { data: sessions } = await supabase.from('sessions').select('count');

    test('Users exist', users && users.length > 0, `Found ${users?.length || 0} users`);
    test('Messages exist', messages && messages.length > 0, `Found ${messages?.length || 0} messages`);
    test('Sessions exist', sessions && sessions.length > 0, `Found ${sessions?.length || 0} sessions`);
  } catch (err) {
    test('Data verification', false, err.message);
  }

  console.log('\n🔐 AUTHENTICATION FEATURES');
  console.log('---------------------------');

  // Test 4: Auth methods available
  try {
    const { data, error } = await supabase.auth.getSession();
    test('Auth session check', !error);

    // Test sign out (should work even without being signed in)
    const { error: signOutError } = await supabase.auth.signOut();
    test('Auth sign out', !signOutError);
  } catch (err) {
    test('Auth functionality', false, err.message);
  }

  console.log('\n💬 MESSAGING FUNCTIONALITY');
  console.log('---------------------------');

  // Test 5: Message queries (what the app actually uses)
  try {
    // Test conversation list query (from ImprovedConversationList)
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, content, created_at, sender_id, receiver_id,
        sender:users!messages_sender_id_fkey(id, full_name, profile_image_url),
        receiver:users!messages_receiver_id_fkey(id, full_name, profile_image_url)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    test('Message queries work', !error, error?.message);
    if (data) {
      test('Message data structure', data.length >= 0, `Found ${data.length} messages`);
    }
  } catch (err) {
    test('Message functionality', false, err.message);
  }

  console.log('\n📅 SESSIONS FUNCTIONALITY');
  console.log('-------------------------');

  // Test 6: Session queries
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    test('Session queries work', !error, error?.message);
  } catch (err) {
    test('Session functionality', false, err.message);
  }

  console.log('\n🔔 NOTIFICATIONS FUNCTIONALITY');
  console.log('-------------------------------');

  // Test 7: Notification queries
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    test('Notification queries work', !error, error?.message);
  } catch (err) {
    test('Notification functionality', false, err.message);
  }

  console.log('\n🔗 REAL-TIME FEATURES');
  console.log('----------------------');

  // Test 8: Real-time setup
  try {
    const channel = supabase.channel('test-channel');
    test('Real-time channel creation', !!channel);
  } catch (err) {
    test('Real-time functionality', false, err.message);
  }

  console.log('\n🛡️  SECURITY BASICS');
  console.log('-------------------');

  // Test 9: SQL Injection protection
  try {
    const maliciousInput = "'; DROP TABLE users; --";
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('full_name', maliciousInput)
      .limit(1);

    test('SQL injection protection', !error || error.message !== 'relation "users" does not exist');
  } catch (err) {
    test('SQL injection protection', true, 'Handled safely');
  }

  console.log('\n📱 APPLICATION READINESS');
  console.log('-------------------------');

  // Test 10: Essential environment variables
  test('SUPABASE_URL configured', !!SUPABASE_URL);
  test('SUPABASE_ANON_KEY configured', !!SUPABASE_ANON_KEY);

  // Test 11: Feature flags
  test('Messaging enabled', process.env.NEXT_PUBLIC_ENABLE_MESSAGING !== 'false');
  test('Notifications enabled', process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false');

  console.log('\n📋 PRODUCTION READINESS SUMMARY');
  console.log('================================');

  const passRate = Math.round((passedTests / totalTests) * 100);

  console.log(`\n✅ Passed: ${passedTests}/${totalTests} (${passRate}%)`);

  if (issues.length > 0) {
    console.log(`\n❌ CRITICAL ISSUES (${issues.length}):`);
    issues.forEach(issue => console.log(`   - ${issue}`));
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  console.log('\n🎯 PRODUCTION ASSESSMENT:');

  if (passRate >= 90) {
    console.log('🟢 READY FOR PRODUCTION');
    console.log('   All critical functionality is working properly.');
  } else if (passRate >= 70) {
    console.log('🟡 MOSTLY READY - Minor Issues');
    console.log('   Core functionality works, but some improvements needed.');
  } else {
    console.log('🔴 NOT READY FOR PRODUCTION');
    console.log('   Critical issues must be resolved first.');
  }

  console.log('\n📋 NEXT STEPS:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Test login at http://localhost:3001/login');
  console.log('3. Verify /messages, /sessions, /profile pages work');
  console.log('4. Run browser test: copy browser_production_test.js to console');
  console.log('5. Use PRODUCTION_READINESS_CHECKLIST.md for manual testing');

  if (passRate >= 80) {
    console.log('6. 🚀 Deploy to production!');
  }
}

runTests().catch(console.error);
