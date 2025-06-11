// Test the actual sessions page functionality with proper authentication
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function testSessionsFunctionality() {
  console.log('🧪 Testing sessions page functionality...\n');

  // Test 1: Check if we can query without auth (RLS check)
  console.log('1. Testing RLS - Sessions without authentication:');
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(5);

    if (error) {
      console.log('✅ RLS WORKING - Cannot access without auth:', error.message);
    } else {
      console.log('⚠️ RLS ISSUE - Can access sessions without auth. Records:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Sample data:', data[0]);
      }
    }
  } catch (e) {
    console.log('✅ RLS WORKING - Exception without auth:', e.message);
  }

  console.log('\n2. Testing RLS - Group Sessions without authentication:');
  try {
    const { data, error } = await supabase
      .from('group_sessions')
      .select('*')
      .limit(5);

    if (error) {
      console.log('✅ RLS WORKING - Cannot access without auth:', error.message);
    } else {
      console.log('⚠️ RLS ISSUE - Can access group sessions without auth. Records:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Sample data:', data[0]);
      }
    }
  } catch (e) {
    console.log('✅ RLS WORKING - Exception without auth:', e.message);
  }

  // Test 2: Check user profiles access (needed for sessions display)
  console.log('\n3. Testing user profiles access:');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, full_name, email')
      .limit(1);

    if (error) {
      console.log('❌ Cannot access user profiles:', error.message);
    } else {
      console.log('✅ Can access user profiles. Count:', data?.length || 0);
    }
  } catch (e) {
    console.log('❌ Exception accessing user profiles:', e.message);
  }

  // Test 3: Test the exact query pattern used in get-sessions.ts
  console.log('\n4. Testing get-sessions.ts query pattern:');

  // This simulates what happens when a user tries to access their sessions
  const dummyUserId = '12345678-1234-1234-1234-123456789012';

  try {
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
      .or(`organizer_id.eq.${dummyUserId},participant_id.eq.${dummyUserId}`)
      .order("scheduled_at", { ascending: true });

    if (sessionsError) {
      console.log('Sessions query error:', sessionsError.message);
    } else {
      console.log('✅ Sessions query successful. Found:', sessions?.length || 0, 'sessions');
    }

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
      .or(`creator_id.eq.${dummyUserId}`)
      .order("scheduled_at", { ascending: true });

    if (groupSessionsError) {
      console.log('Group sessions query error:', groupSessionsError.message);
    } else {
      console.log('✅ Group sessions query successful. Found:', groupSessions?.length || 0, 'group sessions');
    }

  } catch (e) {
    console.log('❌ Query pattern exception:', e.message);
  }

  console.log('\n=== SESSIONS FUNCTIONALITY TEST COMPLETE ===');
}

testSessionsFunctionality();
