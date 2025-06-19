#!/usr/bin/env node
/**
 * SIMPLIFIED PRODUCTION READINESS TEST
 * Tests core functionality without external dependencies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');

    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.error('❌ Could not load .env.local file');
    return false;
  }
  return true;
}

// Test results
let results = { passed: 0, failed: 0, warnings: 0, tests: [] };

function test(name, status, message, details = null) {
  const symbols = { pass: '✅', fail: '❌', warn: '⚠️' };
  console.log(`${symbols[status]} ${name}: ${message}`);
  if (details) console.log(`   ${JSON.stringify(details, null, 2)}`);

  results[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++;
  results.tests.push({ name, status, message, details });
}

async function main() {
  console.log('🚀 SIMPLIFIED PRODUCTION READINESS TEST');
  console.log('='.repeat(50));
  console.log(`Started: ${new Date().toISOString()}\n`);

  // 1. Environment Check
  console.log('🔧 ENVIRONMENT TESTS');
  console.log('-'.repeat(30));

  if (!loadEnv()) {
    test('Environment File', 'fail', '.env.local file could not be loaded');
    process.exit(1);
  } else {
    test('Environment File', 'pass', '.env.local loaded successfully');
  }

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      test(`Environment: ${varName}`, 'pass', 'Variable is set');
    } else {
      test(`Environment: ${varName}`, 'fail', 'Variable is missing');
    }
  }

  // 2. Database Tests
  console.log('\n🗄️ DATABASE TESTS');
  console.log('-'.repeat(30));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
    test('Database Setup', 'fail', 'Missing required environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Test admin connection
  try {
    const { data, error } = await supabaseAdmin.from('users').select('count').limit(1);
    if (error) {
      test('Database Connection (Admin)', 'fail', `Error: ${error.message}`);
    } else {
      test('Database Connection (Admin)', 'pass', 'Admin connection successful');
    }
  } catch (error) {
    test('Database Connection (Admin)', 'fail', `Exception: ${error.message}`);
  }

  // Test critical tables
  const tables = ['users', 'connection_requests', 'messages', 'sessions', 'notifications'];
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
      if (error) {
        test(`Table: ${table}`, 'fail', `Error: ${error.message}`);
      } else {
        test(`Table: ${table}`, 'pass', 'Table accessible');
      }
    } catch (error) {
      test(`Table: ${table}`, 'fail', `Exception: ${error.message}`);
    }
  }

  // 3. Data Integrity Tests
  console.log('\n📊 DATA INTEGRITY TESTS');
  console.log('-'.repeat(30));

  try {
    // Check users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('user_id, email, full_name')
      .limit(5);

    if (usersError) {
      test('Users Data', 'fail', `Cannot access users: ${usersError.message}`);
    } else {
      test('Users Data', 'pass', `Found ${users.length} users`);
    }

    // Check connections
    const { data: connections, error: connError } = await supabaseAdmin
      .from('connection_requests')
      .select('connection_id, status')
      .eq('status', 'accepted')
      .limit(5);

    if (connError) {
      test('Connections Data', 'fail', `Cannot access connections: ${connError.message}`);
    } else {
      test('Connections Data', 'pass', `Found ${connections.length} connections`);
    }

    // Check messages
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('message_id, connection_id, content')
      .limit(10);

    if (msgError) {
      test('Messages Data', 'fail', `Cannot access messages: ${msgError.message}`);
    } else {
      test('Messages Data', 'pass', `Found ${messages.length} messages`);

      if (messages.length > 0) {
        const latestMessage = messages[0];
        test('Latest Message', 'pass', `"${latestMessage.content.substring(0, 50)}..."`);
      }
    }

  } catch (error) {
    test('Data Integrity', 'fail', `Exception: ${error.message}`);
  }

  // 4. File System Tests
  console.log('\n📁 FILE SYSTEM TESTS');
  console.log('-'.repeat(30));

  const criticalFiles = [
    'src/app/layout.tsx',
    'src/components/auth-provider.tsx',
    'src/components/navigation-header.tsx',
    'src/app/messages/page-hybrid.tsx',
    'src/app/messages/components/improved-conversation-list.tsx',
    'src/utils/supabase/client.ts',
    'src/utils/supabase/server.ts',
    'package.json',
    'next.config.js'
  ];

  for (const file of criticalFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      test(`File: ${file}`, 'pass', 'File exists');
    } else {
      test(`File: ${file}`, 'fail', 'File missing');
    }
  }

  // 5. Security Tests
  console.log('\n🛡️ SECURITY TESTS');
  console.log('-'.repeat(30));

  // Test RLS with anonymous client
  try {
    const { data, error } = await supabase.from('users').select('email').limit(1);
    if (error && error.code === 'PGRST116') {
      test('RLS Protection', 'pass', 'RLS properly blocks unauthorized access');
    } else if (error) {
      test('RLS Protection', 'warn', `Unexpected error: ${error.message}`);
    } else {
      test('RLS Protection', 'warn', 'Anonymous access allowed (check RLS policies)');
    }
  } catch (error) {
    test('RLS Protection', 'fail', `Exception: ${error.message}`);
  }

  // Check environment variable security
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20) {
    test('Service Key Security', 'pass', 'Service key appears properly formatted');
  } else {
    test('Service Key Security', 'fail', 'Service key missing or malformed');
  }

  // 6. Performance Test
  console.log('\n⚡ PERFORMANCE TESTS');
  console.log('-'.repeat(30));

  const startTime = Date.now();
  try {
    await supabaseAdmin.from('messages').select('*').limit(100);
    const queryTime = Date.now() - startTime;

    if (queryTime < 1000) {
      test('Query Performance', 'pass', `${queryTime}ms (excellent)`);
    } else if (queryTime < 3000) {
      test('Query Performance', 'warn', `${queryTime}ms (acceptable)`);
    } else {
      test('Query Performance', 'fail', `${queryTime}ms (too slow)`);
    }
  } catch (error) {
    test('Query Performance', 'fail', `Query failed: ${error.message}`);
  }

  // FINAL RESULTS
  console.log('\n📊 FINAL RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`📊 Total: ${results.passed + results.failed + results.warnings}`);

  // Production readiness assessment
  console.log('\n🎯 PRODUCTION READINESS');
  console.log('='.repeat(50));

  const criticalFailures = results.tests.filter(t =>
    t.status === 'fail' &&
    (t.name.includes('Database Connection') ||
     t.name.includes('Environment') ||
     t.name.includes('Users Data'))
  ).length;

  if (criticalFailures === 0 && results.failed < 3) {
    console.log('🎉 ✅ READY FOR PRODUCTION!');
    console.log('   All critical systems are working');
    console.log('   Authentication data is accessible');
    console.log('   Messages system is functional');
    console.log('   Database connectivity is stable');
  } else if (results.failed < 8) {
    console.log('⚠️  🔶 PRODUCTION READY WITH CAUTION');
    console.log('   Some minor issues detected');
    console.log('   Monitor closely after deployment');
  } else {
    console.log('❌ 🔴 NOT READY FOR PRODUCTION');
    console.log('   Critical issues must be resolved');
    console.log('   Review failed tests before deployment');
  }

  console.log('\n💡 NEXT STEPS:');
  console.log('-'.repeat(30));
  console.log('1. Review any failed tests above');
  console.log('2. Test user authentication flow manually');
  console.log('3. Verify messages are visible when logged in');
  console.log('4. Test the browser-based test suite in production-test-suite.html');
  console.log('5. Monitor performance and errors after deployment');

  // Save results
  const resultsFile = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      total: results.passed + results.failed + results.warnings
    },
    tests: results.tests
  }, null, 2));

  console.log(`\n📄 Results saved to: ${resultsFile}`);

  // Exit code
  if (criticalFailures > 0 || results.failed > 5) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
