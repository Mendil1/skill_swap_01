// Simple test to verify sessions functionality
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Using service role key to bypass RLS policies
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSessions() {
  console.log('🔄 Testing session functionality...\n');

  try {
    // Test sessions query with new column names
    console.log('1. Testing sessions table...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, scheduled_at, organizer_id, participant_id, status')
      .limit(5);

    if (sessionsError) {
      console.error('❌ Sessions error:', sessionsError.message);
    } else {
      console.log('✅ Sessions query successful');
      console.log(`   Found ${sessions?.length || 0} sessions`);
    }

    // Test group sessions
    console.log('\n2. Testing group sessions table...');
    const { data: groupSessions, error: groupError } = await supabase
      .from('group_sessions')
      .select('id, topic, creator_id, status')
      .limit(5);

    if (groupError) {
      console.error('❌ Group sessions error:', groupError.message);
    } else {
      console.log('✅ Group sessions query successful');
      console.log(`   Found ${groupSessions?.length || 0} group sessions`);
    }

    // Test users table
    console.log('\n3. Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, full_name')
      .limit(3);

    if (usersError) {
      console.error('❌ Users error:', usersError.message);
    } else {
      console.log('✅ Users query successful');
      console.log(`   Found ${users?.length || 0} users`);
    }

    // Test connection requests
    console.log('\n4. Testing connection_requests table...');
    const { data: connections, error: connError } = await supabase
      .from('connection_requests')
      .select('connection_id, sender_id, receiver_id, status')
      .limit(3);

    if (connError) {
      console.error('❌ Connection requests error:', connError.message);
    } else {
      console.log('✅ Connection requests query successful');
      console.log(`   Found ${connections?.length || 0} connections`);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testSessions();
