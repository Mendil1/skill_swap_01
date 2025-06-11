"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { createNotification } from "@/utils/notifications";
import { processPendingNotifications } from "@/utils/notification-retry";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface User {
  id: string;
  email: string | null;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export default function NotificationTestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [permissionResults, setPermissionResults] = useState<any>(null);
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user data and check local storage on page load
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

    // Check for pending notifications in local storage
    const checkLocalStorage = () => {
      try {
        if (typeof window !== "undefined") {
          const pending = JSON.parse(localStorage.getItem("pending_notifications") || "[]");
          setPendingNotifications(pending.length);
        }
      } catch (error) {
        console.error("Error checking local storage:", error);
      }
    };

    checkAuth();
    checkLocalStorage();
  }, []);

  // Run a comprehensive test of notification creation
  const testCreateNotification = async () => {
    if (!user) {
      setError("You must be logged in to test notifications");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Test notification creation through the client utility
      const notificationData = {
        userId: user.id,
        type: "system" as const,
        message: `Test notification created at ${new Date().toLocaleTimeString()}`,
        referenceId: "test-" + Date.now()
      };

      // Create the notification
      const result = await createNotification(notificationData);

      // Record the test result
      addTestResult({
        success: !!result,
        message: result ? "Successfully created notification via client utility" : "Failed to create notification",
        details: result,
        timestamp: new Date().toISOString()
      });

      // Display success message
      if (result) {
        setSuccess("Test notification created successfully!");
      }

      // Process any pending notifications
      const retryResult = await processPendingNotifications();
      if (retryResult.processed > 0) {
        addTestResult({
          success: true,
          message: `Processed ${retryResult.processed} pending notifications`,
          details: retryResult,
          timestamp: new Date().toISOString()
        });
      }

      // Refresh the notification list
      fetchNotifications();

      // Update pending notification count
      if (typeof window !== "undefined") {
        const pending = JSON.parse(localStorage.getItem("pending_notifications") || "[]");
        setPendingNotifications(pending.length);
      }
    } catch (error) {
      console.error("Error creating test notification:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Error: ${errorMessage}`);

      addTestResult({
        success: false,
        message: "Error creating notification",
        details: { error: errorMessage },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Test direct API call
  const testApiDirectly = async () => {
    if (!user) {
      setError("You must be logged in to test the API");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare notification data
      const notificationData = {
        userId: user.id,
        type: "system",
        message: `API direct test at ${new Date().toLocaleTimeString()}`,
        referenceId: "api-test-" + Date.now()
      };

      // Make direct API call
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();

      // Record the test result
      addTestResult({
        success: response.ok,
        message: response.ok ? "Successfully created notification via direct API call" : "API call failed",
        details: result,
        timestamp: new Date().toISOString()
      });

      // Display appropriate message
      if (response.ok) {
        setSuccess("API test successful! Notification created directly via API.");
      } else {
        setError(`API Error: ${result.error || "Unknown error"}`);
      }

      // Refresh the notification list
      fetchNotifications();
    } catch (error) {
      console.error("Error testing API directly:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`API Error: ${errorMessage}`);

      addTestResult({
        success: false,
        message: "Error making direct API call",
        details: { error: errorMessage },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply notification permissions
  const applyPermissions = async () => {
    if (!user) {
      setError("You must be logged in to apply permissions");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setPermissionResults(null);

    try {
      // Call the permission application API
      const response = await fetch("/api/apply-notification-permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      setPermissionResults(result);

      // Record the test result
      addTestResult({
        success: result.success,
        message: result.success
          ? "Successfully applied notification permissions"
          : "Failed to apply permissions",
        details: result,
        timestamp: new Date().toISOString()
      });

      // Display appropriate message
      if (result.success) {
        setSuccess("Notification permissions applied successfully!");
      } else {
        setError(`Permission Error: ${result.error || "Failed to apply permissions"}`);
      }
    } catch (error) {
      console.error("Error applying permissions:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Permission Error: ${errorMessage}`);

      addTestResult({
        success: false,
        message: "Error applying permissions",
        details: { error: errorMessage },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Call the API to get notifications
      const response = await fetch(`/api/notifications?userId=${user.id}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setNotificationList(result.data);

          addTestResult({
            success: true,
            message: `Retrieved ${result.data.length} notifications`,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        const errorText = await response.text();
        console.error("Error fetching notifications:", errorText);

        addTestResult({
          success: false,
          message: "Failed to fetch notifications",
          details: { error: errorText },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Exception fetching notifications:", error);
    }
  };

  // Process pending notifications
  const processPending = async () => {
    if (pendingNotifications === 0) {
      setSuccess("No pending notifications to process");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await processPendingNotifications();

      // Update the count
      if (typeof window !== "undefined") {
        const pending = JSON.parse(localStorage.getItem("pending_notifications") || "[]");
        setPendingNotifications(pending.length);
      }

      addTestResult({
        success: true,
        message: `Processed ${result.processed} pending notifications`,
        details: result,
        timestamp: new Date().toISOString()
      });

      setSuccess(`Processed ${result.processed} pending notifications`);

      // Refresh the notification list
      fetchNotifications();
    } catch (error) {
      console.error("Error processing pending notifications:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to add a test result
  const addTestResult = (result: TestResult) => {
    setTestResults(prevResults => [result, ...prevResults].slice(0, 20)); // Keep only the most recent 20 results
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };

  if (loading && !user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Notification System Test</h1>

      {!user && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to test the notification system.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Current authentication status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Status:</strong> {user ? "Authenticated" : "Not Authenticated"}</div>
              {user && (
                <>
                  <div><strong>User ID:</strong> {user.id}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local Storage</CardTitle>
            <CardDescription>Pending notifications in queue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Pending Notifications:</strong> {pendingNotifications}</div>
              <div className="pt-2">
                <Button
                  onClick={processPending}
                  disabled={!user || pendingNotifications === 0}
                  className="mr-2"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Process Pending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Client Utility</CardTitle>
            <CardDescription>Create notification using client utility</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testCreateNotification}
              disabled={!user || loading}
              className="w-full"
            >
              Create Test Notification
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test API Directly</CardTitle>
            <CardDescription>Make direct call to notifications API</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testApiDirectly}
              disabled={!user || loading}
              className="w-full"
              variant="outline"
            >
              Test API Call
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apply Permissions</CardTitle>
            <CardDescription>Fix notification system permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={applyPermissions}
              disabled={!user || loading}
              className="w-full"
              variant="secondary"
            >
              Apply SQL Permissions
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Recent test outcomes</CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No tests run yet</div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={result.success ? 'text-green-700' : 'text-red-700'}>
                        {result.message}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(result.timestamp)}
                      </div>
                    </div>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer">Details</summary>
                        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Your notifications
              <Button
                onClick={fetchNotifications}
                disabled={!user}
                variant="ghost"
                size="sm"
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {!user ? (
              <div className="text-center text-gray-500 py-4">Please log in to view notifications</div>
            ) : notificationList.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No notifications found</div>
            ) : (
              <div className="space-y-3">
                {notificationList.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-md border ${
                      notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(notification.created_at)}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Type: {notification.type} {notification.reference_id && `• Ref: ${notification.reference_id}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {permissionResults && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Permission Application Results</CardTitle>
            <CardDescription>Results from applying SQL permissions</CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <pre className="text-xs p-4 bg-gray-100 rounded overflow-x-auto">
              {JSON.stringify(permissionResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
