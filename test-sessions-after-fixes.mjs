// Test script for sessions functionality after column name fixes
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSessionsAfterFixes() {
  console.log('🔄 Testing sessions functionality after column name fixes...\n');

  try {
    // Test 1: Check if we can fetch sessions with new column names
    console.log('1. Testing one-on-one sessions query...');
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        status,
        organizer_id,
        participant_id
      `)
      .limit(5);

    if (sessionsError) {
      console.error('❌ Sessions query failed:', sessionsError);
    } else {
      console.log('✅ Sessions query successful');
      console.log(`   Found ${sessions?.length || 0} sessions`);
      if (sessions && sessions.length > 0) {
        console.log('   Sample session structure:', Object.keys(sessions[0]));
      }
    }

    // Test 2: Check group sessions with new column names
    console.log('\n2. Testing group sessions query...');
    const { data: groupSessions, error: groupSessionsError } = await supabase
      .from("group_sessions")
      .select(`
        id,
        topic,
        scheduled_at,
        duration_minutes,
        status,
        creator_id
      `)
      .limit(5);

    if (groupSessionsError) {
      console.error('❌ Group sessions query failed:', groupSessionsError);
    } else {
      console.log('✅ Group sessions query successful');
      console.log(`   Found ${groupSessions?.length || 0} group sessions`);
      if (groupSessions && groupSessions.length > 0) {
        console.log('   Sample group session structure:', Object.keys(groupSessions[0]));
      }
    }

    // Test 3: Check group session participants with new column names
    console.log('\n3. Testing group session participants query...');
    const { data: participants, error: participantsError } = await supabase
      .from("group_session_participants")
      .select(`
        group_session_id,
        user_id
      `)
      .limit(5);

    if (participantsError) {
      console.error('❌ Group session participants query failed:', participantsError);
    } else {
      console.log('✅ Group session participants query successful');
      console.log(`   Found ${participants?.length || 0} participants`);
      if (participants && participants.length > 0) {
        console.log('   Sample participant structure:', Object.keys(participants[0]));
      }
    }

    // Test 4: Check users table access
    console.log('\n4. Testing users table access...');
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("user_id, full_name, email, profile_image_url")
      .limit(3);

    if (usersError) {
      console.error('❌ Users query failed:', usersError);
    } else {
      console.log('✅ Users query successful');
      console.log(`   Found ${users?.length || 0} users`);
      if (users && users.length > 0) {
        console.log('   Sample user structure:', Object.keys(users[0]));
      }
    }

    // Test 5: Check connection_requests table access
    console.log('\n5. Testing connection_requests table access...');
    const { data: connections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select(`
        connection_id,
        sender_id,
        receiver_id,
        status,
        created_at
      `)
      .limit(3);

    if (connectionsError) {
      console.error('❌ Connection requests query failed:', connectionsError);
    } else {
      console.log('✅ Connection requests query successful');
      console.log(`   Found ${connections?.length || 0} connections`);
      if (connections && connections.length > 0) {
        console.log('   Sample connection structure:', Object.keys(connections[0]));
      }
    }

    console.log('\n🎉 Sessions functionality test completed!');
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

testSessionsAfterFixes();
