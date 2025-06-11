"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { createNotification } from "@/utils/notifications";
import { retryNotification } from "@/utils/notification-retry";
import type { Notification } from "@/types/notifications";

// Define types for our component
interface User {
  id: string;
  email: string | null;  app_metadata: {
    provider?: string;
    [key: string]: unknown;
  };
  user_metadata: {
    [key: string]: unknown;
  };
  aud: string;
  created_at: string;
}

interface TestResult {
  success?: boolean;
  created?: Notification;
  retrieved?: Notification[];
  directTest?: boolean;
  retryTest?: boolean;  result?: unknown;
  timestamp?: string;
  error?: string;
}

export default function TestNotificationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
    useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        setUser(data.user as User);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Error fetching user. Please make sure you're logged in.");
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for notifications
    const handleNotification = () => {
      setNotificationCount(prev => prev + 1);
    };

    window.addEventListener('local-notification', handleNotification);
    window.addEventListener('new-notification', handleNotification);

    return () => {
      window.removeEventListener('local-notification', handleNotification);
      window.removeEventListener('new-notification', handleNotification);
    };
  }, []);

  const testServerNotifications = async () => {
    if (!user) {
      setError("Please log in to test notifications");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/test-notifications?userId=${user.id}`);
      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        setTestResult(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Error testing notifications: ${errorMessage}`);
      console.error("Error testing notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const testDirectNotification = async () => {
    if (!user) {
      setError("Please log in to test notifications");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createNotification({
        userId: user.id,
        type: "system",
        message: `Direct notification test at ${new Date().toLocaleTimeString()}`,
      });

      setTestResult({
        directTest: true,
        result: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Error creating direct notification: ${errorMessage}`);
      console.error("Error creating direct notification:", error);
    } finally {
      setLoading(false);
    }
  };

  const testRetryNotification = async () => {
    if (!user) {
      setError("Please log in to test notifications");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await retryNotification({
        userId: user.id,
        type: "system",
        message: `Retry notification test at ${new Date().toLocaleTimeString()}`,
        maxRetries: 3,
      });

      setTestResult({
        retryTest: true,
        success,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Error in retry notification: ${errorMessage}`);
      console.error("Error in retry notification:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Notification System Test</h1>

      {loading && !user ? (
        <div className="text-center">Loading user information...</div>
      ) : !user ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Please log in to test the notification system
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-2">User Information</h2>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={testServerNotifications}
              disabled={loading}
              className="w-full"
            >
              Test Server Notifications
            </Button>

            <Button
              onClick={testDirectNotification}
              disabled={loading}
              className="w-full"
            >
              Test Direct Notification
            </Button>

            <Button
              onClick={testRetryNotification}
              disabled={loading}
              className="w-full"
            >
              Test Retry Mechanism
            </Button>
          </div>

          {notificationCount > 0 && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {notificationCount} notification event{notificationCount !== 1 ? 's' : ''} received by the client
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {testResult && (
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-2">Test Result</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
