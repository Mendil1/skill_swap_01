import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8'
);

async function checkSessionsSchemaDetailed() {
  console.log('=== CHECKING SESSION TABLES COLUMN NAMES ===');

  // Test sessions table with session_id vs id
  console.log('\n--- Testing SESSIONS table columns ---');
  try {
    const { data: sessionsById, error: sessionsByIdError } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);

    console.log('✅ Sessions table has "id" column:', !sessionsByIdError);
    if (sessionsByIdError) console.log('❌ Error with id:', sessionsByIdError.message);
  } catch (error) {
    console.log('❌ Exception with id:', error.message);
  }

  try {
    const { data: sessionsBySessionId, error: sessionsBySessionIdError } = await supabase
      .from('sessions')
      .select('session_id')
      .limit(1);

    console.log('✅ Sessions table has "session_id" column:', !sessionsBySessionIdError);
    if (sessionsBySessionIdError) console.log('❌ Error with session_id:', sessionsBySessionIdError.message);
  } catch (error) {
    console.log('❌ Exception with session_id:', error.message);
  }

  // Test group_sessions table
  console.log('\n--- Testing GROUP_SESSIONS table columns ---');
  try {
    const { data: groupSessionsById, error: groupSessionsByIdError } = await supabase
      .from('group_sessions')
      .select('id')
      .limit(1);

    console.log('✅ Group sessions table has "id" column:', !groupSessionsByIdError);
    if (groupSessionsByIdError) console.log('❌ Error with id:', groupSessionsByIdError.message);
  } catch (error) {
    console.log('❌ Exception with id:', error.message);
  }

  try {
    const { data: groupSessionsBySessionId, error: groupSessionsBySessionIdError } = await supabase
      .from('group_sessions')
      .select('session_id')
      .limit(1);

    console.log('✅ Group sessions table has "session_id" column:', !groupSessionsBySessionIdError);
    if (groupSessionsBySessionIdError) console.log('❌ Error with session_id:', groupSessionsBySessionIdError.message);
  } catch (error) {
    console.log('❌ Exception with session_id:', error.message);
  }

  // Test group_session_participants table
  console.log('\n--- Testing GROUP_SESSION_PARTICIPANTS table columns ---');
  try {
    const { data: participants, error: participantsError } = await supabase
      .from('group_session_participants')
      .select('session_id, group_session_id, user_id')
      .limit(1);

    console.log('✅ Group session participants query successful:', !participantsError);
    if (participantsError) console.log('❌ Error:', participantsError.message);
    if (participants && participants[0]) {
      console.log('Available columns:', Object.keys(participants[0]));
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }

  // Let's try to actually create test data to see what happens
  console.log('\n=== ATTEMPTING TO CREATE TEST SESSION ===');
  try {
    const testUser = '00000000-0000-0000-0000-000000000001'; // Dummy UUID for test

    const { data: newSession, error: insertError } = await supabase
      .from('sessions')
      .insert({
        organizer_id: testUser,
        participant_id: testUser,
        scheduled_at: new Date().toISOString(),
        duration_minutes: 60,
        status: 'upcoming'
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      console.log('Full error:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Session created successfully');
      console.log('Returned data columns:', Object.keys(newSession || {}));
      console.log('Returned session:', newSession);

      // Clean up test data
      if (newSession && newSession.session_id) {
        await supabase.from('sessions').delete().eq('session_id', newSession.session_id);
        console.log('✅ Test session cleaned up');
      } else if (newSession && newSession.id) {
        await supabase.from('sessions').delete().eq('id', newSession.id);
        console.log('✅ Test session cleaned up using id');
      }
    }
  } catch (error) {
    console.log('❌ Exception creating test session:', error.message);
  }
}

checkSessionsSchemaDetailed().catch(console.error);
