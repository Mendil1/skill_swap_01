// Simple test script to check database state
const { createClient } = require('@supabase/supabase-js');

async function quickDatabaseTest() {
  console.log('🔍 Quick Database Test for Sessions System');
  console.log('==========================================');

  const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Check sessions table structure
    console.log('\n1️⃣ Testing sessions table...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.log('❌ Sessions table error:', sessionsError.message);
      if (sessionsError.message.includes('status')) {
        console.log('   📝 Note: Missing status column - needs schema fix');
      }
    } else {
      console.log('✅ Sessions table accessible');
      if (sessions && sessions.length > 0) {
        console.log('   📄 Sample session columns:', Object.keys(sessions[0]));
      }
    }

    // Test 2: Check group_sessions table structure
    console.log('\n2️⃣ Testing group_sessions table...');
    const { data: groupSessions, error: groupSessionsError } = await supabase
      .from('group_sessions')
      .select('*')
      .limit(1);

    if (groupSessionsError) {
      console.log('❌ Group sessions table error:', groupSessionsError.message);
      if (groupSessionsError.message.includes('status')) {
        console.log('   📝 Note: Missing status column - needs schema fix');
      }
    } else {
      console.log('✅ Group sessions table accessible');
      if (groupSessions && groupSessions.length > 0) {
        console.log('   📄 Sample group session columns:', Object.keys(groupSessions[0]));
      }
    }

    // Test 3: Check users table
    console.log('\n3️⃣ Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, full_name')
      .limit(1);

    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
      console.log('   👥 Users found:', users?.length || 0);
    }

    console.log('\n🎯 Summary:');
    console.log('If you see errors about missing "status" columns, run the schema fixes');
    console.log('Visit: http://localhost:3000/fix-sessions-schema');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
quickDatabaseTest().catch(console.error);
