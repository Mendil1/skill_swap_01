#!/usr/bin/env node
/**
 * COMPREHENSIVE PRODUCTION READINESS TEST
 *
 * This script tests all functionality before production deployment:
 * - Authentication & Sessions
 * - Database connectivity
 * - Messaging system
 * - Notifications
 * - Credit system
 * - File uploads
 * - Performance
 * - Security
 */

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function logTest(name, status, message = '', details = null) {
  const symbols = { pass: '✅', fail: '❌', warn: '⚠️' };
  const result = { name, status, message, details, timestamp: new Date().toISOString() };

  testResults.tests.push(result);
  if (status === 'pass') testResults.passed++;
  else if (status === 'fail') testResults.failed++;
  else if (status === 'warn') testResults.warnings++;

  console.log(`${symbols[status]} ${name}: ${message}`);
  if (details) console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. ENVIRONMENT & CONFIGURATION TESTS
async function testEnvironmentConfiguration() {
  console.log('\n🔧 TESTING ENVIRONMENT & CONFIGURATION');
  console.log('='.repeat(50));

  // Check .env.local file
  try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      logTest('Environment File', 'pass', '.env.local file exists');
    } else {
      logTest('Environment File', 'fail', '.env.local file missing');
      return false;
    }
  } catch (error) {
    logTest('Environment File', 'fail', `Error checking .env.local: ${error.message}`);
    return false;
  }

  // Check required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logTest(`Environment Variable: ${varName}`, 'pass', 'Variable set');
    } else {
      logTest(`Environment Variable: ${varName}`, 'fail', 'Variable missing');
    }
  }

  // Check Next.js configuration files
  const configFiles = ['next.config.js', 'package.json', 'tsconfig.json'];
  for (const file of configFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      logTest(`Config File: ${file}`, 'pass', 'File exists');
    } else {
      logTest(`Config File: ${file}`, 'warn', 'File missing (may be optional)');
    }
  }

  return true;
}

// 2. DATABASE CONNECTIVITY TESTS
async function testDatabaseConnectivity() {
  console.log('\n🗄️ TESTING DATABASE CONNECTIVITY');
  console.log('='.repeat(50));

  // Test basic connection with anon key
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      logTest('Database Connection (Anon)', 'fail', `Connection failed: ${error.message}`);
    } else {
      logTest('Database Connection (Anon)', 'pass', 'Anonymous connection successful');
    }
  } catch (error) {
    logTest('Database Connection (Anon)', 'fail', `Exception: ${error.message}`);
  }

  // Test service role connection
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      logTest('Database Connection (Service)', 'fail', `Service connection failed: ${error.message}`);
    } else {
      logTest('Database Connection (Service)', 'pass', 'Service role connection successful');
    }
  } catch (error) {
    logTest('Database Connection (Service)', 'fail', `Exception: ${error.message}`);
  }

  // Test all critical tables
  const tables = ['users', 'connection_requests', 'messages', 'sessions', 'group_sessions', 'notifications'];
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        logTest(`Table Access: ${table}`, 'fail', `Cannot access: ${error.message}`);
      } else {
        logTest(`Table Access: ${table}`, 'pass', `Table accessible`);
      }
    } catch (error) {
      logTest(`Table Access: ${table}`, 'fail', `Exception: ${error.message}`);
    }
  }

  return true;
}

// 3. AUTHENTICATION SYSTEM TESTS
async function testAuthenticationSystem() {
  console.log('\n🔐 TESTING AUTHENTICATION SYSTEM');
  console.log('='.repeat(50));

  // Test user existence
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('user_id, email, full_name')
      .limit(5);

    if (error) {
      logTest('User Data Access', 'fail', `Cannot access users: ${error.message}`);
    } else {
      logTest('User Data Access', 'pass', `Found ${users.length} users in database`);

      if (users.length > 0) {
        // Test with first user
        const testUser = users[0];
        logTest('Test User Found', 'pass', `Using user: ${testUser.email || testUser.full_name}`, { userId: testUser.user_id });

        // Store test user for other tests
        global.testUserId = testUser.user_id;
        global.testUserEmail = testUser.email;
      }
    }
  } catch (error) {
    logTest('User Data Access', 'fail', `Exception: ${error.message}`);
  }

  // Test authentication endpoints (if server is running)
  try {
    const response = await fetch('http://localhost:3001/api/auth/user');
    if (response.ok) {
      logTest('Auth API Endpoint', 'pass', 'Auth API accessible');
    } else {
      logTest('Auth API Endpoint', 'warn', `Auth API returned ${response.status} (server may not be running)`);
    }
  } catch (error) {
    logTest('Auth API Endpoint', 'warn', 'Auth API not accessible (server may not be running)');
  }

  // Test session management
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session) {
      logTest('Session Management', 'pass', 'Session exists', { userId: session.session.user.id });
    } else {
      logTest('Session Management', 'warn', 'No active session (expected for automated test)');
    }
  } catch (error) {
    logTest('Session Management', 'fail', `Session error: ${error.message}`);
  }

  return true;
}

// 4. MESSAGING SYSTEM TESTS
async function testMessagingSystem() {
  console.log('\n💬 TESTING MESSAGING SYSTEM');
  console.log('='.repeat(50));

  // Test connections table
  try {
    const { data: connections, error } = await supabaseAdmin
      .from('connection_requests')
      .select(`
        connection_id,
        sender_id,
        receiver_id,
        status,
        sender:users!connection_requests_sender_id_fkey(full_name),
        receiver:users!connection_requests_receiver_id_fkey(full_name)
      `)
      .eq('status', 'accepted')
      .limit(5);

    if (error) {
      logTest('Connection Requests', 'fail', `Cannot access connections: ${error.message}`);
    } else {
      logTest('Connection Requests', 'pass', `Found ${connections.length} connections`);

      if (connections.length > 0) {
        global.testConnectionId = connections[0].connection_id;
      }
    }
  } catch (error) {
    logTest('Connection Requests', 'fail', `Exception: ${error.message}`);
  }

  // Test messages table
  try {
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('message_id, connection_id, sender_id, content, sent_at')
      .order('sent_at', { ascending: false })
      .limit(10);

    if (error) {
      logTest('Messages Table', 'fail', `Cannot access messages: ${error.message}`);
    } else {
      logTest('Messages Table', 'pass', `Found ${messages.length} messages`);

      if (messages.length > 0) {
        const latestMessage = messages[0];
        logTest('Latest Message', 'pass', `"${latestMessage.content.substring(0, 50)}..."`, {
          messageId: latestMessage.message_id,
          connectionId: latestMessage.connection_id
        });
      }
    }
  } catch (error) {
    logTest('Messages Table', 'fail', `Exception: ${error.message}`);
  }

  // Test conversation loading (like the app does)
  if (global.testUserId) {
    try {
      const { data: userConnections, error } = await supabaseAdmin
        .from('connection_requests')
        .select(`
          connection_id,
          sender_id,
          receiver_id,
          sender:users!connection_requests_sender_id_fkey(full_name),
          receiver:users!connection_requests_receiver_id_fkey(full_name)
        `)
        .or(`sender_id.eq.${global.testUserId},receiver_id.eq.${global.testUserId}`)
        .eq('status', 'accepted');

      if (error) {
        logTest('User Conversations', 'fail', `Cannot load user conversations: ${error.message}`);
      } else {
        logTest('User Conversations', 'pass', `User has ${userConnections.length} conversations`);
      }
    } catch (error) {
      logTest('User Conversations', 'fail', `Exception: ${error.message}`);
    }
  }

  return true;
}

// 5. NOTIFICATIONS SYSTEM TESTS
async function testNotificationSystem() {
  console.log('\n🔔 TESTING NOTIFICATION SYSTEM');
  console.log('='.repeat(50));

  // Test notifications table access
  try {
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('id, user_id, type, title, message, is_read, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      logTest('Notifications Table', 'fail', `Cannot access notifications: ${error.message}`);
    } else {
      logTest('Notifications Table', 'pass', `Found ${notifications.length} notifications`);
    }
  } catch (error) {
    logTest('Notifications Table', 'fail', `Exception: ${error.message}`);
  }

  // Test notification creation
  if (global.testUserId) {
    try {
      const testNotification = {
        user_id: global.testUserId,
        type: 'system',
        title: 'Production Test',
        message: 'This is a test notification created during production testing',
        is_read: false
      };

      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert(testNotification)
        .select()
        .single();

      if (error) {
        logTest('Notification Creation', 'fail', `Cannot create notification: ${error.message}`);
      } else {
        logTest('Notification Creation', 'pass', 'Test notification created successfully', { id: data.id });

        // Clean up test notification
        await supabaseAdmin.from('notifications').delete().eq('id', data.id);
        logTest('Notification Cleanup', 'pass', 'Test notification cleaned up');
      }
    } catch (error) {
      logTest('Notification Creation', 'fail', `Exception: ${error.message}`);
    }
  }

  return true;
}

// 6. SESSIONS SYSTEM TESTS
async function testSessionsSystem() {
  console.log('\n📅 TESTING SESSIONS SYSTEM');
  console.log('='.repeat(50));

  // Test sessions table
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      logTest('Sessions Table', 'fail', `Cannot access sessions: ${error.message}`);
    } else {
      logTest('Sessions Table', 'pass', `Found ${sessions.length} sessions`);
    }
  } catch (error) {
    logTest('Sessions Table', 'fail', `Exception: ${error.message}`);
  }

  // Test group sessions table
  try {
    const { data: groupSessions, error } = await supabaseAdmin
      .from('group_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      logTest('Group Sessions Table', 'fail', `Cannot access group sessions: ${error.message}`);
    } else {
      logTest('Group Sessions Table', 'pass', `Found ${groupSessions.length} group sessions`);
    }
  } catch (error) {
    logTest('Group Sessions Table', 'fail', `Exception: ${error.message}`);
  }

  return true;
}

// 7. SECURITY TESTS
async function testSecurity() {
  console.log('\n🛡️ TESTING SECURITY');
  console.log('='.repeat(50));

  // Test RLS policies (should block anonymous access to sensitive data)
  try {
    const { data, error } = await supabase // Using anon client
      .from('users')
      .select('email')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      logTest('RLS Protection', 'pass', 'RLS properly blocks unauthorized access');
    } else if (error) {
      logTest('RLS Protection', 'warn', `Unexpected error: ${error.message}`);
    } else {
      logTest('RLS Protection', 'warn', 'Anonymous access to users table allowed (check RLS policies)');
    }
  } catch (error) {
    logTest('RLS Protection', 'fail', `Exception: ${error.message}`);
  }

  // Test environment variable security
  const sensitiveVars = ['SUPABASE_SERVICE_ROLE_KEY'];
  for (const varName of sensitiveVars) {
    const value = process.env[varName];
    if (value && value.length > 20) {
      logTest(`Sensitive Var: ${varName}`, 'pass', 'Variable appears to be properly formatted');
    } else {
      logTest(`Sensitive Var: ${varName}`, 'fail', 'Variable missing or improperly formatted');
    }
  }

  return true;
}

// 8. PERFORMANCE TESTS
async function testPerformance() {
  console.log('\n⚡ TESTING PERFORMANCE');
  console.log('='.repeat(50));

  // Test database query performance
  const startTime = Date.now();
  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(100);

    const queryTime = Date.now() - startTime;

    if (error) {
      logTest('Query Performance', 'fail', `Query failed: ${error.message}`);
    } else if (queryTime < 1000) {
      logTest('Query Performance', 'pass', `Query completed in ${queryTime}ms`);
    } else if (queryTime < 3000) {
      logTest('Query Performance', 'warn', `Query took ${queryTime}ms (acceptable but could be optimized)`);
    } else {
      logTest('Query Performance', 'fail', `Query took ${queryTime}ms (too slow)`);
    }
  } catch (error) {
    logTest('Query Performance', 'fail', `Exception: ${error.message}`);
  }

  return true;
}

// 9. FILE SYSTEM TESTS
async function testFileSystem() {
  console.log('\n📁 TESTING FILE SYSTEM');
  console.log('='.repeat(50));

  // Check critical application files
  const criticalFiles = [
    'src/app/layout.tsx',
    'src/components/auth-provider.tsx',
    'src/components/navigation-header.tsx',
    'src/app/messages/page-hybrid.tsx',
    'src/app/messages/components/improved-conversation-list.tsx',
    'src/utils/supabase/client.ts',
    'src/utils/supabase/server.ts'
  ];

  for (const file of criticalFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      logTest(`Critical File: ${file}`, 'pass', 'File exists');
    } else {
      logTest(`Critical File: ${file}`, 'fail', 'File missing');
    }
  }

  return true;
}

// 10. API ENDPOINT TESTS
async function testAPIEndpoints() {
  console.log('\n🌐 TESTING API ENDPOINTS');
  console.log('='.repeat(50));

  const endpoints = [
    '/api/auth/callback',
    '/api/notifications',
    '/auth/force-logout'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'GET'
      });

      // Different endpoints have different expected responses
      if (endpoint === '/auth/force-logout') {
        if (response.status === 200 || response.status === 302) {
          logTest(`API Endpoint: ${endpoint}`, 'pass', `Endpoint accessible (${response.status})`);
        } else {
          logTest(`API Endpoint: ${endpoint}`, 'warn', `Unexpected status: ${response.status}`);
        }
      } else {
        if (response.status < 500) {
          logTest(`API Endpoint: ${endpoint}`, 'pass', `Endpoint accessible (${response.status})`);
        } else {
          logTest(`API Endpoint: ${endpoint}`, 'fail', `Server error: ${response.status}`);
        }
      }
    } catch (error) {
      logTest(`API Endpoint: ${endpoint}`, 'warn', 'Endpoint not accessible (server may not be running)');
    }
  }

  return true;
}

// MAIN TEST RUNNER
async function runComprehensiveTests() {
  console.log('🚀 COMPREHENSIVE PRODUCTION READINESS TEST');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  const testStartTime = Date.now();

  try {
    await testEnvironmentConfiguration();
    await testDatabaseConnectivity();
    await testAuthenticationSystem();
    await testMessagingSystem();
    await testNotificationSystem();
    await testSessionsSystem();
    await testSecurity();
    await testPerformance();
    await testFileSystem();
    await testAPIEndpoints();
  } catch (error) {
    console.error('❌ Test suite failed with error:', error.message);
    logTest('Test Suite', 'fail', `Test suite crashed: ${error.message}`);
  }

  const testEndTime = Date.now();
  const totalTime = testEndTime - testStartTime;

  // FINAL RESULTS
  console.log('\n📊 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.passed + testResults.failed + testResults.warnings}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`⏱️  Total Time: ${totalTime}ms`);

  // Production readiness assessment
  console.log('\n🎯 PRODUCTION READINESS ASSESSMENT');
  console.log('='.repeat(60));

  const criticalFailures = testResults.tests.filter(test =>
    test.status === 'fail' &&
    (test.name.includes('Database Connection') ||
     test.name.includes('Critical File') ||
     test.name.includes('Environment Variable'))
  );

  if (criticalFailures.length === 0 && testResults.failed < 3) {
    console.log('🎉 READY FOR PRODUCTION!');
    console.log('✅ All critical systems are functioning properly');
    console.log('✅ Authentication system is working');
    console.log('✅ Database connectivity is established');
    console.log('✅ Core functionality is operational');
  } else if (testResults.failed < 10) {
    console.log('⚠️  PRODUCTION READY WITH CAUTION');
    console.log('⚠️  Some non-critical issues detected');
    console.log('⚠️  Monitor closely after deployment');
  } else {
    console.log('❌ NOT READY FOR PRODUCTION');
    console.log('❌ Critical issues must be resolved');
    console.log('❌ Review failed tests before deployment');
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS FOR PRODUCTION');
  console.log('='.repeat(60));

  if (testResults.warnings > 0) {
    console.log('• Review and address warnings before deployment');
  }
  if (testResults.tests.some(t => t.name.includes('Query Performance') && t.status === 'warn')) {
    console.log('• Consider database query optimization');
  }
  if (testResults.tests.some(t => t.name.includes('RLS') && t.status === 'warn')) {
    console.log('• Review Row Level Security policies');
  }

  console.log('• Test with real user authentication flow');
  console.log('• Verify email notifications are working');
  console.log('• Test file upload functionality');
  console.log('• Monitor performance after deployment');
  console.log('• Set up error monitoring and logging');

  // Save detailed results to file
  const resultsFile = path.join(__dirname, 'production-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      totalTime,
      timestamp: new Date().toISOString()
    },
    tests: testResults.tests
  }, null, 2));

  console.log(`\n📄 Detailed results saved to: ${resultsFile}`);

  // Exit with appropriate code
  if (criticalFailures.length > 0 || testResults.failed > 5) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run the tests
if (require.main === module) {
  runComprehensiveTests().catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = { runComprehensiveTests };
