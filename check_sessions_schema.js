import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSessionsSchema() {
  console.log('=== CHECKING SESSIONS TABLE SCHEMA ===');

  try {
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.error('Sessions table error:', sessionsError);
    } else {
      console.log('Sessions table structure:', sessions && sessions[0] ? Object.keys(sessions[0]) : 'No data');
      console.log('Sample session data:', sessions?.[0] || 'No sessions found');
    }
  } catch (error) {
    console.error('Error checking sessions table:', error);
  }

  console.log('\n=== CHECKING GROUP_SESSIONS TABLE SCHEMA ===');

  try {
    const { data: groupSessions, error: groupSessionsError } = await supabase
      .from('group_sessions')
      .select('*')
      .limit(1);

    if (groupSessionsError) {
      console.error('Group sessions table error:', groupSessionsError);
    } else {
      console.log('Group sessions table structure:', groupSessions && groupSessions[0] ? Object.keys(groupSessions[0]) : 'No data');
      console.log('Sample group session data:', groupSessions?.[0] || 'No group sessions found');
    }
  } catch (error) {
    console.error('Error checking group sessions table:', error);
  }

  console.log('\n=== CHECKING GROUP_SESSION_PARTICIPANTS TABLE SCHEMA ===');

  try {
    const { data: participants, error: participantsError } = await supabase
      .from('group_session_participants')
      .select('*')
      .limit(1);

    if (participantsError) {
      console.error('Group session participants table error:', participantsError);
    } else {
      console.log('Group session participants table structure:', participants && participants[0] ? Object.keys(participants[0]) : 'No data');
      console.log('Sample participant data:', participants?.[0] || 'No participants found');
    }
  } catch (error) {
    console.error('Error checking group session participants table:', error);
  }

  console.log('\n=== TESTING SESSIONS QUERY FROM CODE ===');

  try {
    // This matches the query in sessions.ts getUserSessions function
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        status,
        organizer_id,
        participant_id
      `)
      .limit(3);

    if (sessionsError) {
      console.error('Sessions query error:', sessionsError);
    } else {
      console.log('Sessions query successful, count:', sessions?.length || 0);
      console.log('Sample queried session:', sessions?.[0] || 'No sessions');
    }
  } catch (error) {
    console.error('Error in sessions query:', error);
  }

  console.log('\n=== TESTING GROUP SESSIONS QUERY FROM CODE ===');

  try {
    // This matches the query in sessions.ts getUserSessions function
    const { data: groupSessions, error: groupSessionsError } = await supabase
      .from('group_sessions')
      .select(`
        id,
        topic,
        scheduled_at,
        duration_minutes,
        status,
        creator_id
      `)
      .limit(3);

    if (groupSessionsError) {
      console.error('Group sessions query error:', groupSessionsError);
    } else {
      console.log('Group sessions query successful, count:', groupSessions?.length || 0);
      console.log('Sample queried group session:', groupSessions?.[0] || 'No group sessions');
    }
  } catch (error) {
    console.error('Error in group sessions query:', error);
  }
}

checkSessionsSchema().catch(console.error);
