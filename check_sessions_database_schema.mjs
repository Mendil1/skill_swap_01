// Check the actual sessions database schema and verify column names
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env.local file manually
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSessionsSchema() {
  console.log('🔍 Checking sessions database schema...\n');

  try {
    // Check sessions table structure
    console.log('📋 SESSIONS TABLE:');
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.error('❌ Error querying sessions:', sessionsError.message);
    } else if (sessionsData && sessionsData.length > 0) {
      console.log('✅ Sessions table columns:', Object.keys(sessionsData[0]));
      console.log('📊 Sample session data:', sessionsData[0]);
    } else {
      console.log('ℹ️ No sessions data found, trying to get table structure...');

      // Try to get structure with empty result
      const { data: emptyData, error: emptyError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', 'non-existent-id');

      if (emptyError) {
        console.error('❌ Error getting sessions structure:', emptyError.message);
      }
    }

    console.log('\n📋 GROUP_SESSIONS TABLE:');
    const { data: groupSessionsData, error: groupSessionsError } = await supabase
      .from('group_sessions')
      .select('*')
      .limit(1);

    if (groupSessionsError) {
      console.error('❌ Error querying group_sessions:', groupSessionsError.message);
    } else if (groupSessionsData && groupSessionsData.length > 0) {
      console.log('✅ Group sessions table columns:', Object.keys(groupSessionsData[0]));
      console.log('📊 Sample group session data:', groupSessionsData[0]);
    } else {
      console.log('ℹ️ No group sessions data found');
    }

    console.log('\n📋 GROUP_SESSION_PARTICIPANTS TABLE:');
    const { data: participantsData, error: participantsError } = await supabase
      .from('group_session_participants')
      .select('*')
      .limit(1);

    if (participantsError) {
      console.error('❌ Error querying group_session_participants:', participantsError.message);
    } else if (participantsData && participantsData.length > 0) {
      console.log('✅ Group session participants table columns:', Object.keys(participantsData[0]));
      console.log('📊 Sample participant data:', participantsData[0]);
    } else {
      console.log('ℹ️ No group session participants data found');
    }

    // Test specific column queries to see what actually works
    console.log('\n🧪 TESTING COLUMN QUERIES:');

    // Test organizer_id vs creator_id
    console.log('\n🔍 Testing sessions table columns...');

    const { data: testOrganizerData, error: testOrganizerError } = await supabase
      .from('sessions')
      .select('organizer_id')
      .limit(1);

    if (testOrganizerError) {
      console.log('❌ organizer_id column does NOT exist:', testOrganizerError.message);
    } else {
      console.log('✅ organizer_id column EXISTS');
    }

    const { data: testCreatorData, error: testCreatorError } = await supabase
      .from('sessions')
      .select('creator_id')
      .limit(1);

    if (testCreatorError) {
      console.log('❌ creator_id column does NOT exist:', testCreatorError.message);
    } else {
      console.log('✅ creator_id column EXISTS');
    }

    // Check count of each table
    console.log('\n📊 TABLE COUNTS:');

    const { count: sessionsCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });
    console.log(`📈 Sessions: ${sessionsCount} records`);

    const { count: groupSessionsCount } = await supabase
      .from('group_sessions')
      .select('*', { count: 'exact', head: true });
    console.log(`📈 Group Sessions: ${groupSessionsCount} records`);

    const { count: participantsCount } = await supabase
      .from('group_session_participants')
      .select('*', { count: 'exact', head: true });
    console.log(`📈 Group Session Participants: ${participantsCount} records`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSessionsSchema();
