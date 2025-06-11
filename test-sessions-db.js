// Test script to verify sessions functions
const { createClient } = require('@supabase/supabase-js');

async function testSessionsFunction() {
  console.log('Testing sessions data fetching...');

  // Test basic Supabase connection
  const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('user_id')
      .limit(1);

    if (testError) {
      console.error('❌ Supabase connection failed:', testError.message);
      return;
    }
    console.log('✅ Supabase connection successful');

    // Test sessions table
    console.log('2. Testing sessions table access...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('session_id, organizer_id, participant_id, scheduled_at, duration_minutes, status')
      .limit(5);

    if (sessionsError) {
      console.error('❌ Sessions table error:', sessionsError.message);
      console.log('This indicates the sessions table might need schema updates');
    } else {
      console.log('✅ Sessions table accessible');
      console.log('Sessions found:', sessions?.length || 0);
    }

    // Test group_sessions table
    console.log('3. Testing group_sessions table access...');
    const { data: groupSessions, error: groupSessionsError } = await supabase
      .from('group_sessions')
      .select('session_id, organizer_id, topic, scheduled_at, duration_minutes, status')
      .limit(5);

    if (groupSessionsError) {
      console.error('❌ Group sessions table error:', groupSessionsError.message);
      console.log('This indicates the group_sessions table needs schema updates');
    } else {
      console.log('✅ Group sessions table accessible');
      console.log('Group sessions found:', groupSessions?.length || 0);
    }

    // Test users table (our profiles equivalent)
    console.log('4. Testing users table for profile data...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, full_name, email, profile_image_url')
      .limit(5);

    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
      console.log('Users found:', users?.length || 0);
    }

    console.log('\\n=== Test Summary ===');
    console.log('If you see errors above, run the schema fix script');
    console.log('If all tests pass, the sessions page should load successfully');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testSessionsFunction();
