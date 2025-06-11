"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createNotification } from "@/utils/notifications";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Terminal, RefreshCw, Hammer, Database } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  email: string | null;
}

interface DiagnosticResult {
  name: string;
  success: boolean;
  message: string;
  timestamp: string;
  details?: any;
}

export default function NotificationDiagnosticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("diagnose");
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [fixResults, setFixResults] = useState<DiagnosticResult[]>([]);
  const [testNotifications, setTestNotifications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [isApplyingFixes, setIsApplyingFixes] = useState(false);

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

  // Helper function to add diagnostic result
  const addDiagnosticResult = (result: DiagnosticResult) => {
    setDiagnosticResults(prev => [result, ...prev]);
  };

  // Helper function to add fix result
  const addFixResult = (result: DiagnosticResult) => {
    setFixResults(prev => [result, ...prev]);
  };

  // Run full diagnostics
  const runDiagnostics = async () => {
    if (!user) {
      setError("You must be logged in to run diagnostics");
      return;
    }

    setIsRunningDiagnostics(true);
    setError(null);
    setSuccess(null);
    setDiagnosticResults([]);

    try {
      // 1. Check environment variables
      const envCheck = {
        name: "Environment Variables",
        success: true,
        message: "Environment variables are configured correctly",
        timestamp: new Date().toISOString(),
        details: {}
      };

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        envCheck.success = false;
        envCheck.message = "Missing NEXT_PUBLIC_SUPABASE_URL";
      } else if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        envCheck.success = false;
        envCheck.message = "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY";
      } else {
        envCheck.details = {
          url: "defined",
          anon_key: "defined"
        };
      }

      addDiagnosticResult(envCheck);

      // 2. Check Supabase client connection
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("notifications").select("count(*)").limit(1);

        addDiagnosticResult({
          name: "Supabase Client Connection",
          success: !error,
          message: error ? `Connection error: ${error.message}` : "Successfully connected to Supabase",
          timestamp: new Date().toISOString(),
          details: { data, error: error ? error.message : null }
        });
      } catch (error) {
        console.error("Error testing Supabase connection:", error);
        addDiagnosticResult({
          name: "Supabase Client Connection",
          success: false,
          message: "Failed to connect to Supabase",
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }

      // 3. Test notification API (GET)
      try {
        const response = await fetch(`/api/notifications?userId=${user.id}`);
        const responseText = await response.text();
        let result;

        try {
          result = JSON.parse(responseText);
        } catch (e) {
          result = { error: responseText };
        }

        addDiagnosticResult({
          name: "Notification API (GET)",
          success: response.ok,
          message: response.ok ? "Notification API is working correctly" : `API error: ${result.error || "Unknown error"}`,
          timestamp: new Date().toISOString(),
          details: { status: response.status, result }
        });

        if (response.ok && result.data) {
          setTestNotifications(result.data);
        }
      } catch (error) {
        console.error("Error testing notification API:", error);
        addDiagnosticResult({
          name: "Notification API (GET)",
          success: false,
          message: "Failed to connect to notification API",
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }

      // 4. Test notification API (POST)
      try {
        const notificationData = {
          userId: user.id,
          type: "system",
          message: `Diagnostic test notification at ${new Date().toLocaleTimeString()}`,
          referenceId: `diagnostic-${Date.now()}`
        };

        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationData),
        });

        const result = await response.json();

        addDiagnosticResult({
          name: "Notification API (POST)",
          success: response.ok,
          message: response.ok ? "Successfully created test notification" : `API error: ${result.error || "Unknown error"}`,
          timestamp: new Date().toISOString(),
          details: { status: response.status, result }
        });
      } catch (error) {
        console.error("Error testing notification creation:", error);
        addDiagnosticResult({
          name: "Notification API (POST)",
          success: false,
          message: "Failed to create test notification",
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }

      // 5. Test client utility
      try {
        const notificationData = {
          userId: user.id,
          type: "system" as const,
          message: `Client utility test at ${new Date().toLocaleTimeString()}`,
          referenceId: `client-${Date.now()}`
        };

        const result = await createNotification(notificationData);

        addDiagnosticResult({
          name: "Client Notification Utility",
          success: !!result,
          message: result ? "Successfully created notification via client utility" : "Failed to create notification via client utility",
          timestamp: new Date().toISOString(),
          details: { result }
        });
      } catch (error) {
        console.error("Error testing client utility:", error);
        addDiagnosticResult({
          name: "Client Notification Utility",
          success: false,
          message: "Error using client notification utility",
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }

      // 6. Check for pending notifications
      if (typeof window !== "undefined") {
        try {
          const pendingNotifications = JSON.parse(
            localStorage.getItem("pending_notifications") || "[]"
          );

          addDiagnosticResult({
            name: "Pending Notifications",
            success: true,
            message: pendingNotifications.length > 0
              ? `Found ${pendingNotifications.length} pending notifications`
              : "No pending notifications found",
            timestamp: new Date().toISOString(),
            details: { count: pendingNotifications.length }
          });
        } catch (error) {
          console.error("Error checking pending notifications:", error);
          addDiagnosticResult({
            name: "Pending Notifications",
            success: false,
            message: "Error checking pending notifications",
            timestamp: new Date().toISOString(),
            details: { error: error instanceof Error ? error.message : "Unknown error" }
          });
        }
      }

      // Update success/error message based on overall results
      const successfulTests = diagnosticResults.filter(r => r.success).length;
      const totalTests = diagnosticResults.length;

      if (successfulTests === totalTests) {
        setSuccess("All diagnostic tests passed successfully!");
      } else {
        setError(`${successfulTests}/${totalTests} tests passed. Please check the results for details.`);
      }
    } catch (error) {
      console.error("Error running diagnostics:", error);
      setError("An unexpected error occurred while running diagnostics");
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Apply fixes to the notification system
  const applyFixes = async () => {
    if (!user) {
      setError("You must be logged in to apply fixes");
      return;
    }

    setIsApplyingFixes(true);
    setError(null);
    setSuccess(null);
    setFixResults([]);

    try {      // 1. First, try the fix-notification-permissions endpoint
      try {
        addFixResult({
          name: "Notification Permissions Fix",
          success: false,
          message: "Starting fix process...",
          timestamp: new Date().toISOString()
        });

        // Try all available fix endpoints
        const endpoints = [
          "/api/fix-notification-permissions",
          "/api/apply-notification-permissions",
          "/api/direct-sql-fix"
        ];

        let anySuccess = false;
        let successDetails = null;

        for (const endpoint of endpoints) {
          try {
            console.log(`Trying fix endpoint: ${endpoint}`);
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                anySuccess = true;
                successDetails = {
                  endpoint,
                  ...result
                };
                break; // Stop after first successful endpoint
              }
            }
          } catch (error) {
            console.error(`Error with endpoint ${endpoint}:`, error);
          }
        }

        addFixResult({
          name: "Notification Permissions Fix",
          success: anySuccess,
          message: anySuccess
            ? `Successfully applied notification permissions using ${successDetails?.endpoint}`
            : "Failed to apply permissions with any endpoint",
          timestamp: new Date().toISOString(),
          details: successDetails
        });
      } catch (error) {
        console.error("Error applying notification permissions:", error);
        addFixResult({
          name: "Notification Permissions Fix",
          success: false,
          message: "Error applying notification permissions",
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }

      // 2. Also try the legacy endpoint as backup
      try {
        const response = await fetch("/api/apply-notification-permissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        addFixResult({
          name: "Legacy Permissions Fix",
          success: response.ok && result.success,
          message: response.ok
            ? (result.success ? "Successfully applied legacy notification permissions" : "Partial success with legacy permissions")
            : `Failed to apply legacy permissions: ${result.error || "Unknown error"}`,
          timestamp: new Date().toISOString(),
          details: { status: response.status, result }
        });
      } catch (error) {
        console.error("Error applying legacy notification permissions:", error);
        addFixResult({
          name: "Legacy Permissions Fix",
          success: false,
          message: "Error applying legacy notification permissions",
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }

      // 3. Test notification creation after fixes
      try {
        const notificationData = {
          userId: user.id,
          type: "system" as const,
          message: `Post-fix test notification at ${new Date().toLocaleTimeString()}`,
          referenceId: `post-fix-${Date.now()}`
        };

        const result = await createNotification(notificationData);

        addFixResult({
          name: "Post-Fix Notification Test",
          success: !!result,
          message: result ? "Successfully created notification after applying fixes" : "Failed to create notification after fixes",
          timestamp: new Date().toISOString(),
          details: { result }
        });
      } catch (error) {
        console.error("Error testing post-fix notification:", error);
        addFixResult({
          name: "Post-Fix Notification Test",
          success: false,
          message: "Error creating notification after fixes",
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }

      // 4. Fetch notifications to see if our fixes worked
      try {
        const response = await fetch(`/api/notifications?userId=${user.id}`);

        if (response.ok) {
          const result = await response.json();

          if (result.success && Array.isArray(result.data)) {
            setTestNotifications(result.data);

            addFixResult({
              name: "Post-Fix Notification Fetch",
              success: true,
              message: `Successfully fetched ${result.data.length} notifications after applying fixes`,
              timestamp: new Date().toISOString(),
              details: { count: result.data.length }
            });
          } else {
            addFixResult({
              name: "Post-Fix Notification Fetch",
              success: false,
              message: "Failed to fetch notifications after fixes",
              timestamp: new Date().toISOString(),
              details: { result }
            });
          }
        } else {
          const errorText = await response.text();
          addFixResult({
            name: "Post-Fix Notification Fetch",
            success: false,
            message: "Failed to fetch notifications after fixes",
            timestamp: new Date().toISOString(),
            details: { status: response.status, error: errorText }
          });
        }
      } catch (error) {
        console.error("Error fetching notifications after fixes:", error);
        addFixResult({
          name: "Post-Fix Notification Fetch",
          success: false,
          message: "Error fetching notifications after fixes",
          timestamp: new Date().toISOString(),
          details: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }

      // Update success/error message based on fix results
      const successfulFixes = fixResults.filter(r => r.success).length;
      const totalFixes = fixResults.length;

      if (successfulFixes > 0) {
        setSuccess(`Applied ${successfulFixes}/${totalFixes} fixes successfully. Please run diagnostics again to verify.`);
      } else {
        setError("Failed to apply any fixes. Please check the manual fix instructions.");
      }
    } catch (error) {
      console.error("Error applying fixes:", error);
      setError("An unexpected error occurred while applying fixes");
    } finally {
      setIsApplyingFixes(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Notification System Diagnostics</h1>
      <div className="text-center py-8">Loading...</div>
    </div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Notification System Diagnostics</h1>

      {!user && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to use the notification diagnostic tools.
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
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Run diagnostics or apply fixes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={runDiagnostics}
                disabled={!user || isRunningDiagnostics}
                className="flex-1"
              >
                <Terminal className="mr-2 h-4 w-4" />
                {isRunningDiagnostics ? "Running..." : "Run Diagnostics"}
              </Button>

              <Button
                onClick={applyFixes}
                disabled={!user || isApplyingFixes}
                variant="secondary"
                className="flex-1"
              >
                <Hammer className="mr-2 h-4 w-4" />
                {isApplyingFixes ? "Applying..." : "Apply Fixes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="diagnose" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="diagnose">Diagnostic Results</TabsTrigger>
          <TabsTrigger value="fixes">Fix Results</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnose" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Diagnostic Results
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runDiagnostics}
                  disabled={!user || isRunningDiagnostics}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>Results from system diagnostics</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {diagnosticResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {isRunningDiagnostics ? "Running diagnostics..." : "No diagnostics run yet. Click 'Run Diagnostics' to start."}
                </div>
              ) : (
                <div className="space-y-4">
                  {diagnosticResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-md border ${
                        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatTimestamp(result.timestamp)}
                        </div>
                      </div>
                      <div className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.message}
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
        </TabsContent>

        <TabsContent value="fixes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Fix Results
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyFixes}
                  disabled={!user || isApplyingFixes}
                >
                  <Hammer className="h-4 w-4 mr-2" />
                  Apply Again
                </Button>
              </CardTitle>
              <CardDescription>Results from applying fixes</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {fixResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {isApplyingFixes ? "Applying fixes..." : "No fixes applied yet. Click 'Apply Fixes' to start."}
                </div>
              ) : (
                <div className="space-y-4">
                  {fixResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-md border ${
                        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatTimestamp(result.timestamp)}
                        </div>
                      </div>
                      <div className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.message}
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
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Your Notifications
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetch(`/api/notifications?userId=${user?.id}`).then(async (res) => {
                      if (res.ok) {
                        const data = await res.json();
                        if (data.success && Array.isArray(data.data)) {
                          setTestNotifications(data.data);
                        }
                      }
                    }).catch(console.error);
                  }}
                  disabled={!user}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>Actual notifications in your account</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {!user ? (
                <div className="text-center py-8 text-gray-500">
                  Please log in to view your notifications
                </div>
              ) : testNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No notifications found
                </div>
              ) : (
                <div className="space-y-3">
                  {testNotifications.map((notification) => (
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
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Manual Fix Instructions</CardTitle>
            <CardDescription>If automatic fixes don't work, follow these steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Check Environment Variables</h3>
                <p>Make sure these environment variables are correctly set in your <code>.env.local</code> file:</p>
                <pre className="text-xs p-3 bg-gray-100 rounded mt-2">
                  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url{'\n'}
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key{'\n'}
                  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">2. Apply SQL Fixes Manually</h3>
                <p>Go to your Supabase dashboard, open the SQL Editor, and run these commands:</p>
                <pre className="text-xs p-3 bg-gray-100 rounded mt-2 overflow-x-auto">                  {`-- Drop all existing notification policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for others" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Bypass RLS for notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can do anything with notifications" ON notifications;
DROP POLICY IF EXISTS "Allow anon to insert notifications" ON notifications;
DROP POLICY IF EXISTS "Service role bypass" ON notifications;

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create Service Role Policy
CREATE POLICY "Service role can do anything with notifications"
ON notifications
USING (auth.jwt()->>'role' = 'service_role');

-- Create User Policies
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">3. See Detailed Documentation</h3>
                <p>For more information, check these resources:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li><Link href="/notification-tools" className="text-blue-600 hover:underline">Notification Tools Page</Link></li>
                  <li>Review the <code>NOTIFICATION_SYSTEM.md</code> and <code>NOTIFICATION_MANUAL_FIX.md</code> files in the project root</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
