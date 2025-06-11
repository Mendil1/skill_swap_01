import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Missing Supabase configuration'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Execute schema fixes step by step
    const schemaFixes = [
      // Add status column to sessions table
      `ALTER TABLE sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming';`,

      // Add status column to group_sessions table
      `ALTER TABLE group_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming';`,

      // Enable RLS on sessions
      `ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;`,

      // Enable RLS on group_sessions
      `ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;`,

      // Enable RLS on group_session_participants
      `ALTER TABLE group_session_participants ENABLE ROW LEVEL SECURITY;`,
    ];

    const results = [];

    for (const sql of schemaFixes) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
          console.error(`Error executing: ${sql}`, error);
          results.push({ sql, error: error.message, success: false });
        } else {
          results.push({ sql, success: true });
        }
      } catch (err) {
        console.error(`Exception executing: ${sql}`, err);
        results.push({ sql, error: err instanceof Error ? err.message : 'Unknown error', success: false });
      }
    }

    // Create RLS policies
    const policies = [
      // Sessions RLS policy
      `DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;`,
      `CREATE POLICY "Users can view their own sessions" ON sessions
        FOR ALL USING (
          auth.uid()::text = organizer_id::text OR
          auth.uid()::text = participant_id::text
        );`,

      // Group sessions RLS policy
      `DROP POLICY IF EXISTS "Users can view group sessions they're involved in" ON group_sessions;`,
      `CREATE POLICY "Users can view group sessions they're involved in" ON group_sessions
        FOR ALL USING (
          auth.uid()::text = organizer_id::text OR
          EXISTS (
            SELECT 1 FROM group_session_participants gsp
            WHERE gsp.session_id = group_sessions.session_id
            AND gsp.user_id::text = auth.uid()::text
          )
        );`,

      // Group session participants RLS policy
      `DROP POLICY IF EXISTS "Users can view group session participants" ON group_session_participants;`,
      `CREATE POLICY "Users can view group session participants" ON group_session_participants
        FOR ALL USING (
          auth.uid()::text = user_id::text OR
          EXISTS (
            SELECT 1 FROM group_sessions gs
            WHERE gs.session_id = group_session_participants.session_id
            AND gs.organizer_id::text = auth.uid()::text
          )
        );`
    ];

    for (const sql of policies) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
          console.error(`Error executing policy: ${sql}`, error);
          results.push({ sql, error: error.message, success: false });
        } else {
          results.push({ sql, success: true });
        }
      } catch (err) {
        console.error(`Exception executing policy: ${sql}`, err);
        results.push({ sql, error: err instanceof Error ? err.message : 'Unknown error', success: false });
      }
    }

    return NextResponse.json({
      message: 'Schema fixes applied',
      results,
      success: results.filter(r => r.success).length,
      errors: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('Error applying schema fixes:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
