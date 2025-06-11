// Check RLS policies for sessions tables
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8'
);

async function checkRLSPolicies() {
  console.log('🔒 Checking RLS policies for sessions tables...\n');

  try {
    // Check RLS status for sessions table
    const { data: rlsStatus } = await supabase
      .rpc('pg_tables')
      .select('tablename, rowsecurity')
      .in('tablename', ['sessions', 'group_sessions', 'group_session_participants']);

    console.log('RLS Status:', rlsStatus);

    // Check existing policies
    const { data: policies } = await supabase
      .from('pg_policies')
      .select('*')
      .in('tablename', ['sessions', 'group_sessions', 'group_session_participants']);

    console.log('Existing Policies:', policies);

  } catch (error) {
    console.log('Error checking RLS:', error.message);
  }
}

checkRLSPolicies();
