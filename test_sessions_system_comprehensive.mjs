import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8'
);

async function testSessionsSystemComprehensively() {
  console.log('=== COMPREHENSIVE SESSIONS SYSTEM TEST ===\n');

  // Step 1: Create test users
  console.log('1. Setting up test users...');
  const testUsers = [];

  try {
    // Create two test users
    const { data: user1, error: user1Error } = await supabase.auth.admin.createUser({
      email: 'testuser1@sessions.test',
      password: 'testpass123',
      email_confirm: true
    });

    const { data: user2, error: user2Error } = await supabase.auth.admin.createUser({
      email: 'testuser2@sessions.test',
      password: 'testpass123',
      email_confirm: true
    });

    if (user1Error || user2Error) {
      console.log('❌ Error creating test users:', user1Error?.message || user2Error?.message);
      return;
    }

    testUsers.push(user1.user, user2.user);
    console.log('✅ Test users created successfully');

    // Step 2: Create user profiles
    console.log('\n2. Creating user profiles...');

    const profiles = [
      {
        user_id: user1.user.id,
        full_name: 'Test User 1',
        email: 'testuser1@sessions.test',
        bio: 'Test user for sessions testing'
      },
      {
        user_id: user2.user.id,
        full_name: 'Test User 2',
        email: 'testuser2@sessions.test',
        bio: 'Another test user for sessions testing'
      }
    ];

    const { error: profilesError } = await supabase
      .from('users')
      .upsert(profiles);

    if (profilesError) {
      console.log('❌ Error creating profiles:', profilesError.message);
      return;
    }
    console.log('✅ User profiles created');

    // Step 3: Create connection between users
    console.log('\n3. Creating connection between users...');

    const { error: connectionError } = await supabase
      .from('connection_requests')
      .insert({
        sender_id: user1.user.id,
        receiver_id: user2.user.id,
        status: 'accepted'
      });

    if (connectionError) {
      console.log('❌ Error creating connection:', connectionError.message);
    } else {
      console.log('✅ Connection created successfully');
    }

    // Step 4: Test one-on-one session creation
    console.log('\n4. Testing one-on-one session creation...');

    const sessionData = {
      organizer_id: user1.user.id,
      participant_id: user2.user.id,
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration_minutes: 60,
      status: 'upcoming'
    };

    const { data: newSession, error: sessionError } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.log('❌ Error creating session:', sessionError.message);
      console.log('Full error:', JSON.stringify(sessionError, null, 2));
    } else {
      console.log('✅ One-on-one session created successfully');
      console.log('Session ID:', newSession.id);
    }

    // Step 5: Test group session creation
    console.log('\n5. Testing group session creation...');

    const groupSessionData = {
      creator_id: user1.user.id,
      topic: 'JavaScript Best Practices',
      scheduled_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      duration_minutes: 90,
      status: 'upcoming'
    };

    const { data: newGroupSession, error: groupSessionError } = await supabase
      .from('group_sessions')
      .insert(groupSessionData)
      .select()
      .single();

    if (groupSessionError) {
      console.log('❌ Error creating group session:', groupSessionError.message);
      console.log('Full error:', JSON.stringify(groupSessionError, null, 2));
    } else {
      console.log('✅ Group session created successfully');
      console.log('Group Session ID:', newGroupSession.id);

      // Step 6: Add participant to group session
      console.log('\n6. Testing group session participation...');

      const { error: participantError } = await supabase
        .from('group_session_participants')
        .insert({
          group_session_id: newGroupSession.id,
          user_id: user2.user.id,
          joined_at: new Date().toISOString()
        });

      if (participantError) {
        console.log('❌ Error adding participant:', participantError.message);
      } else {
        console.log('✅ Participant added to group session');
      }
    }

    // Step 7: Test data retrieval (simulating getUserSessions)
    console.log('\n7. Testing session data retrieval...');

    // Test one-on-one sessions query
    const { data: sessions, error: sessionsRetrievalError } = await supabase
      .from('sessions')
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        status,
        organizer_id,
        participant_id
      `)
      .or(`organizer_id.eq.${user1.user.id},participant_id.eq.${user1.user.id}`)
      .order('scheduled_at', { ascending: true });

    if (sessionsRetrievalError) {
      console.log('❌ Error retrieving sessions:', sessionsRetrievalError.message);
    } else {
      console.log('✅ Sessions retrieved successfully');
      console.log('Session count:', sessions?.length || 0);
      if (sessions && sessions.length > 0) {
        console.log('Sample session:', sessions[0]);
      }
    }

    // Test group sessions query
    const { data: groupSessions, error: groupSessionsRetrievalError } = await supabase
      .from('group_sessions')
      .select(`
        id,
        topic,
        scheduled_at,
        duration_minutes,
        status,
        creator_id
      `)
      .or(
        `creator_id.eq.${user1.user.id},id.in.(select group_session_id from group_session_participants where user_id = ${user1.user.id})`
      )
      .order('scheduled_at', { ascending: true });

    if (groupSessionsRetrievalError) {
      console.log('❌ Error retrieving group sessions:', groupSessionsRetrievalError.message);
    } else {
      console.log('✅ Group sessions retrieved successfully');
      console.log('Group session count:', groupSessions?.length || 0);
      if (groupSessions && groupSessions.length > 0) {
        console.log('Sample group session:', groupSessions[0]);
      }
    }

    // Step 8: Test session updates (cancellation, rescheduling)
    console.log('\n8. Testing session management operations...');

    if (newSession && newSession.id) {
      // Test session cancellation
      const { error: cancelError } = await supabase
        .from('sessions')
        .update({ status: 'cancelled' })
        .eq('id', newSession.id);

      if (cancelError) {
        console.log('❌ Error cancelling session:', cancelError.message);
      } else {
        console.log('✅ Session cancellation works');
      }

      // Test session rescheduling
      const newTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      const { error: rescheduleError } = await supabase
        .from('sessions')
        .update({
          scheduled_at: newTime,
          status: 'upcoming'
        })
        .eq('id', newSession.id);

      if (rescheduleError) {
        console.log('❌ Error rescheduling session:', rescheduleError.message);
      } else {
        console.log('✅ Session rescheduling works');
      }
    }

    console.log('\n=== CLEANUP ===');

    // Clean up test data
    if (newSession?.id) {
      await supabase.from('sessions').delete().eq('id', newSession.id);
    }
    if (newGroupSession?.id) {
      await supabase.from('group_session_participants').delete().eq('group_session_id', newGroupSession.id);
      await supabase.from('group_sessions').delete().eq('id', newGroupSession.id);
    }

    // Clean up connection
    await supabase.from('connection_requests').delete().eq('sender_id', user1.user.id);

    // Clean up profiles
    await supabase.from('users').delete().in('user_id', [user1.user.id, user2.user.id]);

    // Clean up auth users
    await supabase.auth.admin.deleteUser(user1.user.id);
    await supabase.auth.admin.deleteUser(user2.user.id);

    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

testSessionsSystemComprehensively().catch(console.error);
