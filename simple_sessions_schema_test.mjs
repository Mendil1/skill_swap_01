// Simple test to check sessions table structure
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function testSessionsSchema() {
  console.log('Testing sessions table schema...\n');

  // Test organizer_id column
  console.log('Testing organizer_id column...');
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('organizer_id')
      .limit(1);

    if (error) {
      console.log('❌ organizer_id ERROR:', error.message);
    } else {
      console.log('✅ organizer_id column EXISTS');
    }
  } catch (e) {
    console.log('❌ organizer_id EXCEPTION:', e.message);
  }

  // Test creator_id column
  console.log('\nTesting creator_id column...');
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('creator_id')
      .limit(1);

    if (error) {
      console.log('❌ creator_id ERROR:', error.message);
    } else {
      console.log('✅ creator_id column EXISTS');
    }
  } catch (e) {
    console.log('❌ creator_id EXCEPTION:', e.message);
  }

  // Test participant_id column
  console.log('\nTesting participant_id column...');
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('participant_id')
      .limit(1);

    if (error) {
      console.log('❌ participant_id ERROR:', error.message);
    } else {
      console.log('✅ participant_id column EXISTS');
    }
  } catch (e) {
    console.log('❌ participant_id EXCEPTION:', e.message);
  }

  // Get sample data if possible
  console.log('\nTesting full sessions query...');
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Full query ERROR:', error.message);
    } else if (data && data.length > 0) {
      console.log('✅ Sample session columns:', Object.keys(data[0]));
    } else {
      console.log('ℹ️ No session data found but query successful');
    }
  } catch (e) {
    console.log('❌ Full query EXCEPTION:', e.message);
  }

  // Same for group_sessions
  console.log('\n=== GROUP SESSIONS ===');

  // Test creator_id in group_sessions
  console.log('Testing group_sessions.creator_id column...');
  try {
    const { data, error } = await supabase
      .from('group_sessions')
      .select('creator_id')
      .limit(1);

    if (error) {
      console.log('❌ group_sessions.creator_id ERROR:', error.message);
    } else {
      console.log('✅ group_sessions.creator_id column EXISTS');
    }
  } catch (e) {
    console.log('❌ group_sessions.creator_id EXCEPTION:', e.message);
  }

  // Test organizer_id in group_sessions
  console.log('\nTesting group_sessions.organizer_id column...');
  try {
    const { data, error } = await supabase
      .from('group_sessions')
      .select('organizer_id')
      .limit(1);

    if (error) {
      console.log('❌ group_sessions.organizer_id ERROR:', error.message);
    } else {
      console.log('✅ group_sessions.organizer_id column EXISTS');
    }
  } catch (e) {
    console.log('❌ group_sessions.organizer_id EXCEPTION:', e.message);
  }
}

testSessionsSchema();
