import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8'
);

async function checkSessionsPermissions() {
  console.log('=== CHECKING SESSIONS PERMISSIONS & SCHEMA ===\n');

  // 1. Check actual database schema by creating a test session
  console.log('1. Testing actual database schema with INSERT...');
  try {
    const testSessionData = {
      organizer_id: '00000000-0000-0000-0000-000000000001',
      participant_id: '00000000-0000-0000-0000-000000000002',
      scheduled_at: new Date().toISOString(),
      duration_minutes: 60,
      status: 'upcoming'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('sessions')
      .insert(testSessionData)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      console.log('Error details:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Insert successful');
      console.log('Returned columns:', Object.keys(insertData || {}));
      console.log('Session data:', insertData);

      // Clean up test data
      if (insertData?.id) {
        await supabase.from('sessions').delete().eq('id', insertData.id);
        console.log('✅ Test data cleaned up');
      }
    }
  } catch (error) {
    console.log('❌ Exception during insert test:', error.message);
  }

  // 2. Test group sessions
  console.log('\n2. Testing group_sessions schema...');
  try {
    const testGroupSessionData = {
      creator_id: '00000000-0000-0000-0000-000000000001',
      topic: 'Test Topic',
      scheduled_at: new Date().toISOString(),
      duration_minutes: 90,
      status: 'upcoming'
    };

    const { data: groupInsertData, error: groupInsertError } = await supabase
      .from('group_sessions')
      .insert(testGroupSessionData)
      .select()
      .single();

    if (groupInsertError) {
      console.log('❌ Group session insert failed:', groupInsertError.message);
    } else {
      console.log('✅ Group session insert successful');
      console.log('Returned columns:', Object.keys(groupInsertData || {}));

      // Test group_session_participants
      const { data: participantData, error: participantError } = await supabase
        .from('group_session_participants')
        .insert({
          group_session_id: groupInsertData.id,
          user_id: '00000000-0000-0000-0000-000000000001',
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (participantError) {
        console.log('❌ Participant insert failed:', participantError.message);
      } else {
        console.log('✅ Participant insert successful');
        console.log('Participant columns:', Object.keys(participantData || {}));

        // Clean up
        await supabase.from('group_session_participants').delete().eq('group_session_id', groupInsertData.id);
      }

      // Clean up group session
      await supabase.from('group_sessions').delete().eq('id', groupInsertData.id);
      console.log('✅ Group session test data cleaned up');
    }
  } catch (error) {
    console.log('❌ Exception during group session test:', error.message);
  }

  // 3. Check RLS policies
  console.log('\n3. Checking RLS status...');
  try {
    // Check if RLS is enabled by trying to access without auth
    const noAuthSupabase = createClient(
      'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
    );

    const { data: anonSessions, error: anonError } = await noAuthSupabase
      .from('sessions')
      .select('id')
      .limit(1);

    if (anonError) {
      if (anonError.message.includes('RLS') || anonError.message.includes('policy')) {
        console.log('✅ RLS is properly enabled for sessions');
      } else {
        console.log('❌ Unexpected error (not RLS related):', anonError.message);
      }
    } else {
      console.log('⚠️ WARNING: Sessions table accessible without authentication');
      console.log('Retrieved data count:', anonSessions?.length || 0);
    }

    // Test group_sessions RLS
    const { data: anonGroupSessions, error: anonGroupError } = await noAuthSupabase
      .from('group_sessions')
      .select('id')
      .limit(1);

    if (anonGroupError) {
      if (anonGroupError.message.includes('RLS') || anonGroupError.message.includes('policy')) {
        console.log('✅ RLS is properly enabled for group_sessions');
      } else {
        console.log('❌ Unexpected error (not RLS related):', anonGroupError.message);
      }
    } else {
      console.log('⚠️ WARNING: Group sessions table accessible without authentication');
    }

  } catch (error) {
    console.log('❌ Exception during RLS check:', error.message);
  }

  // 4. Test query structure that the app uses
  console.log('\n4. Testing app query structure...');
  try {
    // Simulate the query that get-sessions.ts uses
    const testUserId = '00000000-0000-0000-0000-000000000001';

    const { data: appStyleSessions, error: appStyleError } = await supabase
      .from('sessions')
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        status,
        organizer_id,
        participant_id
      `)
      .or(`organizer_id.eq.${testUserId},participant_id.eq.${testUserId}`)
      .order('scheduled_at', { ascending: true });

    if (appStyleError) {
      console.log('❌ App-style sessions query failed:', appStyleError.message);
    } else {
      console.log('✅ App-style sessions query successful');
      console.log('Query returned:', appStyleSessions?.length || 0, 'sessions');
    }

    // Test group sessions query
    const { data: appStyleGroupSessions, error: appStyleGroupError } = await supabase
      .from('group_sessions')
      .select(`
        id,
        topic,
        scheduled_at,
        duration_minutes,
        status,
        creator_id
      `)
      .or(`creator_id.eq.${testUserId}`)
      .order('scheduled_at', { ascending: true });

    if (appStyleGroupError) {
      console.log('❌ App-style group sessions query failed:', appStyleGroupError.message);
    } else {
      console.log('✅ App-style group sessions query successful');
      console.log('Query returned:', appStyleGroupSessions?.length || 0, 'group sessions');
    }

  } catch (error) {
    console.log('❌ Exception during app query test:', error.message);
  }

  console.log('\n=== PERMISSIONS CHECK COMPLETE ===');
}

checkSessionsPermissions().catch(console.error);
