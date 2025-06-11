"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle, Terminal } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface FixResults {
  message: string;
  results?: any;
}

export default function FixNotificationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FixResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionCompleted, setActionCompleted] = useState(false);

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    checkAuth();
  }, []);

  // Apply the notification fixes
  const applyFixes = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setActionCompleted(false);

    try {
      // Make the API call to apply notification permissions
      const response = await fetch('/api/apply-notification-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResults(data);
      setActionCompleted(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while applying notification fixes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset the notification database by dropping all policies
  const resetNotificationPermissions = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setActionCompleted(false);

    try {
      const supabase = createClient();

      // Apply the SQL directly to reset permissions
      const sqlCommands = [
        "DROP POLICY IF EXISTS \"Users can view their own notifications\" ON notifications",
        "DROP POLICY IF EXISTS \"System can insert notifications\" ON notifications",
        "DROP POLICY IF EXISTS \"Users can insert notifications for others\" ON notifications",
        "DROP POLICY IF EXISTS \"Users can update their own notifications\" ON notifications",
        "DROP POLICY IF EXISTS \"Bypass RLS for notifications\" ON notifications",
        "DROP POLICY IF EXISTS \"Service role can do anything with notifications\" ON notifications",
        "DROP POLICY IF EXISTS \"Allow anon to insert notifications\" ON notifications",
        "DROP POLICY IF EXISTS \"Service role bypass\" ON notifications",
        "DROP POLICY IF EXISTS \"Users can see their own notifications\" ON notifications",
        "DROP POLICY IF EXISTS \"Users can insert their own notifications\" ON notifications",
        "DROP POLICY IF EXISTS \"Admin can do anything with notifications\" ON notifications",
        "ALTER TABLE notifications DISABLE ROW LEVEL SECURITY"
      ];

      const results = [];

      for (const sql of sqlCommands) {
        try {
          // Using rpc to execute SQL directly
          const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
          results.push({
            sql,
            success: !error,
            error: error ? error.message : null
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            sql,
            success: false,
            error: errorMessage
          });
        }
      }

      setResults({ message: 'Reset notification permissions', results });
      setActionCompleted(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while resetting notification permissions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Fix Notification System</CardTitle>
            <CardDescription>Authentication Required</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-amber-600">Please log in to use this utility.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Fix Notification System</CardTitle>
          <CardDescription>
            This utility will apply the correct security policies to make notifications work properly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={applyFixes}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Apply Notification Fixes
              </Button>

              <Button
                onClick={resetNotificationPermissions}
                disabled={loading}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Reset Notification Permissions
              </Button>
            </div>

            {loading && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-700">
                  Working on it... please wait
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}

            {actionCompleted && !error && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Success</p>
                  <p className="text-green-600">
                    {results?.message || 'Operation completed successfully'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              <span>Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
