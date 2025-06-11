'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SessionsSchemaFixPage() {
  const [isApplying, setIsApplying] = useState(false);
  const [results, setResults] = useState<any>(null);

  const applySchemaFixes = async () => {
    setIsApplying(true);
    setResults(null);

    try {
      const response = await fetch('/api/fix-sessions-schema', {
        method: 'POST',
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsApplying(false);
    }
  };

  const addStatusColumns = async () => {
    setIsApplying(true);
    try {
      // Use direct SQL execution to add missing columns
      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'executeSQL',
          sql: `
            DO $$
            BEGIN
                -- Add status column to sessions table
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                             WHERE table_name = 'sessions' AND column_name = 'status') THEN
                    ALTER TABLE sessions ADD COLUMN status VARCHAR(20) DEFAULT 'upcoming';
                END IF;

                -- Add status column to group_sessions table
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                             WHERE table_name = 'group_sessions' AND column_name = 'status') THEN
                    ALTER TABLE group_sessions ADD COLUMN status VARCHAR(20) DEFAULT 'upcoming';
                END IF;
            END $$;
          `
        })
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sessions Schema Fix</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Apply Schema Fixes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This will fix the database schema issues preventing the sessions page from loading.
            </p>

            <div className="space-y-2">
              <Button
                onClick={addStatusColumns}
                disabled={isApplying}
                className="w-full"
              >
                {isApplying ? 'Adding Status Columns...' : 'Add Missing Status Columns'}
              </Button>

              <Button
                onClick={applySchemaFixes}
                disabled={isApplying}
                variant="outline"
                className="w-full"
              >
                {isApplying ? 'Applying Fixes...' : 'Apply All Schema Fixes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Manual Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>If the automatic fixes don't work, run these SQL commands in Supabase SQL Editor:</strong></p>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
{`-- Add status columns
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming';
ALTER TABLE group_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming';

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_session_participants ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own sessions" ON sessions
FOR ALL USING (
  auth.uid()::text = organizer_id::text OR
  auth.uid()::text = participant_id::text
);

CREATE POLICY "Users can view group sessions they're involved in" ON group_sessions
FOR ALL USING (
  auth.uid()::text = organizer_id::text OR
  EXISTS (
    SELECT 1 FROM group_session_participants gsp
    WHERE gsp.session_id = group_sessions.session_id
    AND gsp.user_id::text = auth.uid()::text
  )
);`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
