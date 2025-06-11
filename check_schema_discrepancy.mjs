import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function checkSchemaDiscrepancy() {
  console.log('=== CHECKING SCHEMA DISCREPANCY IN SESSIONS SYSTEM ===\n');

  // Test with actual schema.sql expected column names
  console.log('1. Testing with schema.sql column names (session_id):');
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('session_id, organizer_id, participant_id, scheduled_at, duration_minutes, created_at')
      .limit(1);

    if (error) {
      console.log('❌ Schema.sql columns failed:', error.message);
    } else {
      console.log('✅ Schema.sql columns work fine');
      console.log('Available columns:', data && data[0] ? Object.keys(data[0]) : 'No data found');
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }

  console.log('\n2. Testing with code-expected column names (id):');
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, organizer_id, participant_id, scheduled_at, duration_minutes, status')
      .limit(1);

    if (error) {
      console.log('❌ Code-expected columns failed:', error.message);
    } else {
      console.log('✅ Code-expected columns work fine');
      console.log('Available columns:', data && data[0] ? Object.keys(data[0]) : 'No data found');
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }

  console.log('\n3. Testing group_sessions schema:');
  try {
    const { data, error } = await supabase
      .from('group_sessions')
      .select('session_id, organizer_id, topic, scheduled_at, duration_minutes, created_at')
      .limit(1);

    if (error) {
      console.log('❌ Schema.sql group_sessions columns failed:', error.message);
    } else {
      console.log('✅ Schema.sql group_sessions columns work');
      console.log('Available columns:', data && data[0] ? Object.keys(data[0]) : 'No data found');
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }

  console.log('\n4. Testing group_sessions with code expectations:');
  try {
    const { data, error } = await supabase
      .from('group_sessions')
      .select('id, creator_id, topic, scheduled_at, duration_minutes, status')
      .limit(1);

    if (error) {
      console.log('❌ Code-expected group_sessions columns failed:', error.message);
    } else {
      console.log('✅ Code-expected group_sessions columns work');
      console.log('Available columns:', data && data[0] ? Object.keys(data[0]) : 'No data found');
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }

  console.log('\n5. Testing group_session_participants:');
  try {
    const { data, error } = await supabase
      .from('group_session_participants')
      .select('session_id, user_id, joined_at')
      .limit(1);

    if (error) {
      console.log('❌ Schema.sql group_session_participants columns failed:', error.message);
    } else {
      console.log('✅ Schema.sql group_session_participants columns work');
      console.log('Available columns:', data && data[0] ? Object.keys(data[0]) : 'No data found');
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }

  console.log('\n6. Testing group_session_participants with code expectations:');
  try {
    const { data, error } = await supabase
      .from('group_session_participants')
      .select('group_session_id, user_id, joined_at')
      .limit(1);

    if (error) {
      console.log('❌ Code-expected group_session_participants columns failed:', error.message);
    } else {
      console.log('✅ Code-expected group_session_participants columns work');
      console.log('Available columns:', data && data[0] ? Object.keys(data[0]) : 'No data found');
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }

  console.log('\n=== CONCLUSION ===');
  console.log('This test shows which column names actually exist in the database vs what the code expects.');
}

checkSchemaDiscrepancy().catch(console.error);
