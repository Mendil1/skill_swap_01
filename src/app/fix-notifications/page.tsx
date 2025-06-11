"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface User {
  id: string;
  email: string | null;
}

export default function FixNotificationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [sqlVisible, setSqlVisible] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || null,
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setError("Failed to verify authentication status");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  const applyNotificationPermissions = async () => {
    if (!user) {
      setError("You must be logged in to apply notification permissions");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Call both APIs for better chances of success
      const endpoints = [
        "/api/apply-notification-permissions",
        "/api/fix-notification-permissions"
      ];

      let successfulResponse = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            successfulResponse = data;
            console.log(`Success with endpoint: ${endpoint}`, data);
            break; // Stop after first successful endpoint
          } else {
            console.error(`Failed with endpoint: ${endpoint}`, await response.text());
          }
        } catch (endpointError) {
          console.error(`Error with endpoint ${endpoint}:`, endpointError);
        }
      }

      if (successfulResponse) {
        setResults(successfulResponse);
      } else {
        throw new Error("All permission endpoints failed");
      }
    } catch (error) {
      console.error("Error applying notification permissions:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSqlVisibility = () => {
    setSqlVisible(!sqlVisible);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Fix Notification Permissions</h1>

      {loading && !user ? (
        <div className="text-center">Loading...</div>
      ) : !user ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Please log in to apply notification permissions
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Apply Notification Permissions</h2>
            <p className="mb-4">
              This tool will apply the correct Row Level Security (RLS) policies to your Supabase database
              to ensure that the notification system works properly. It will:
            </p>

            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Enable Row Level Security on the notifications table</li>
              <li>Create a policy to allow service roles to bypass RLS</li>
              <li>Create a policy to allow users to view their own notifications</li>
              <li>Create a policy to allow authenticated users to insert notifications</li>
              <li>Create a policy to allow users to update their own notifications</li>
              <li>Enable realtime for the notifications table</li>
            </ul>

            <div className="space-y-4">
              <Button onClick={applyNotificationPermissions} disabled={loading} className="w-full">
                {loading ? "Applying Permissions..." : "Apply Notification Permissions"}
              </Button>

              <Button onClick={toggleSqlVisibility} variant="outline" className="w-full">
                {sqlVisible ? "Hide SQL" : "Show SQL"}
              </Button>

              {sqlVisible && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">SQL that will be applied:</h3>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
{`-- Drop all existing policies for a clean slate
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for others" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Bypass RLS for notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can do anything with notifications" ON notifications;
DROP POLICY IF EXISTS "Allow anon to insert notifications" ON notifications;
DROP POLICY IF EXISTS "Service role bypass" ON notifications;

-- Ensure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. Allow service role to do anything (this is critical for our API endpoint)
CREATE POLICY "Service role bypass"
ON notifications
USING (true)
WITH CHECK (true);

-- 2. Users can view only their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- 3. Allow ANY authenticated user to insert notifications
CREATE POLICY "Users can insert notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Users can only update their own notifications
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`}
                  </pre>
                </div>
              )}
            </div>
          </Card>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {results && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Results</h2>

              <div className={`p-4 rounded mb-4 ${results.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <p className="font-semibold">{results.message}</p>
              </div>

              <h3 className="text-lg font-medium mb-2">Details:</h3>
              <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">SQL Command</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results && results.results.map((result: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 pr-4 overflow-hidden max-w-[300px] truncate">
                          <code>{result.sql}</code>
                        </td>
                        <td className="py-2">
                          <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                            {result.success ? '✓ Success' : '✗ Failed'}
                          </span>
                        </td>
                        <td className="py-2 overflow-hidden max-w-[300px] truncate">
                          {result.error || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-4">
                <Button onClick={() => window.location.href = '/notification-system-status'} className="w-full">
                  Check Notification System Status
                </Button>

                <Button onClick={() => window.location.href = '/test-notifications'} className="w-full">
                  Test Notifications
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
