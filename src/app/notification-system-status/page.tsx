"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { createNotification } from "@/utils/notifications";
import { processPendingNotifications } from "@/utils/notification-retry";

// Define types for our component
interface User {
  id: string;
  email: string | null;
}

interface SystemStatus {
  envVars: {
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    supabaseServiceRole: boolean;
    siteUrl: boolean;
    enableNotifications: boolean;
  };
  userAuth: {
    isLoggedIn: boolean;
    userId: string | null;
    email: string | null;
  };
  database: {
    canConnectToSupabase: boolean;
    notificationsTableExists: boolean;
    permissionsActive: boolean;
    testInsertSuccessful: boolean;
    testData: any;
  };
  apiEndpoints: {
    testApiEndpoint: boolean;
    apiResponse: any;
    notificationsApiWorks: boolean;
  };
  localStorage: {
    pendingNotifications: number;
    localNotifications: number;
  };
}

export default function NotificationSystemStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    envVars: {
      supabaseUrl: false,
      supabaseAnonKey: false,
      supabaseServiceRole: false,
      siteUrl: false,
      enableNotifications: false,
    },
    userAuth: {
      isLoggedIn: false,
      userId: null,
      email: null,
    },
    database: {
      canConnectToSupabase: false,
      notificationsTableExists: false,
      permissionsActive: false,
      testInsertSuccessful: false,
      testData: null,
    },
    apiEndpoints: {
      testApiEndpoint: false,
      apiResponse: null,
      notificationsApiWorks: false,
    },
    localStorage: {
      pendingNotifications: 0,
      localNotifications: 0,
    },
  });

  // Check environment variables
  useEffect(() => {
    const checkEnvVars = () => {
      const envVars = {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseServiceRole: false, // Can't check this from client
        siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
        enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === "true",
      };

      setSystemStatus(prev => ({
        ...prev,
        envVars,
      }));
    };

    checkEnvVars();
  }, []);

  // Check user authentication
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

          setSystemStatus(prev => ({
            ...prev,
            userAuth: {
              isLoggedIn: true,
              userId: data.user.id,
              email: data.user.email || null,
            },
          }));
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Check local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const pendingNotifications = JSON.parse(
          localStorage.getItem("pending_notifications") || "[]"
        );

        const localNotifications = JSON.parse(
          localStorage.getItem("local_notifications") || "[]"
        );

        setSystemStatus(prev => ({
          ...prev,
          localStorage: {
            pendingNotifications: pendingNotifications.length,
            localNotifications: localNotifications.length,
          },
        }));
      } catch (error) {
        console.error("Error checking local storage:", error);
      }
    }
  }, []);

  // Check database connection and notifications table
  useEffect(() => {
    const checkDatabase = async () => {
      if (!user) return;

      try {
        const supabase = createClient();

        // Check if we can connect to Supabase
        const { error: connectionError } = await supabase.from("notifications").select("count").limit(1);
        const canConnectToSupabase = !connectionError;

        // If we can connect, check if notifications table exists
        let notificationsTableExists = false;
        let testInsertSuccessful = false;
        let testData = null;

        if (canConnectToSupabase) {
          const { error: tableError } = await supabase.from("notifications").select("count").limit(1);
          notificationsTableExists = !tableError;

          // Try a test insert
          if (notificationsTableExists) {
            const { data, error: insertError } = await supabase
              .from("notifications")
              .insert({
                user_id: user.id,
                type: "system",
                message: "Test notification from status page",
                is_read: false,
              })
              .select()
              .single();

            testInsertSuccessful = !insertError;
            testData = data;
          }
        }

        setSystemStatus(prev => ({
          ...prev,
          database: {
            canConnectToSupabase,
            notificationsTableExists,
            permissionsActive: testInsertSuccessful,
            testInsertSuccessful,
            testData,
          },
        }));
      } catch (error) {
        console.error("Error checking database:", error);
      }
    };

    if (user) {
      checkDatabase();
    }
  }, [user]);

  // Check API endpoints
  const checkApiEndpoints = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Test the test-notifications API endpoint
      const testResponse = await fetch(`/api/test-notifications?userId=${user.id}`);
      const testResult = await testResponse.json();

      const testApiEndpoint = testResponse.ok;

      // Test the regular notifications API endpoint
      const notificationResponse = await fetch("/api/notifications?userId=" + user.id);
      const notificationResult = await notificationResponse.json();

      const notificationsApiWorks = notificationResponse.ok;

      setSystemStatus(prev => ({
        ...prev,
        apiEndpoints: {
          testApiEndpoint,
          apiResponse: testResult,
          notificationsApiWorks,
        },
      }));

      // Refresh local storage status after API calls
      if (typeof window !== "undefined") {
        try {
          const pendingNotifications = JSON.parse(
            localStorage.getItem("pending_notifications") || "[]"
          );

          const localNotifications = JSON.parse(
            localStorage.getItem("local_notifications") || "[]"
          );

          setSystemStatus(prev => ({
            ...prev,
            localStorage: {
              pendingNotifications: pendingNotifications.length,
              localNotifications: localNotifications.length,
            },
          }));
        } catch (error) {
          console.error("Error checking local storage:", error);
        }
      }
    } catch (error) {
      console.error("Error checking API endpoints:", error);

      setSystemStatus(prev => ({
        ...prev,
        apiEndpoints: {
          ...prev.apiEndpoints,
          testApiEndpoint: false,
          notificationsApiWorks: false,
          apiResponse: { error: "Failed to connect to API endpoints" },
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  // Create a test notification via the client-side utility
  const createTestNotification = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await createNotification({
        userId: user.id,
        type: "system",
        message: "Test notification created from status page",
      });

      // Process any pending notifications
      processPendingNotifications();

      // Re-check API endpoints to refresh status
      await checkApiEndpoints();
    } catch (error) {
      console.error("Error creating test notification:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update status information
  const refreshStatus = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Refresh local storage status
      if (typeof window !== "undefined") {
        try {
          const pendingNotifications = JSON.parse(
            localStorage.getItem("pending_notifications") || "[]"
          );

          const localNotifications = JSON.parse(
            localStorage.getItem("local_notifications") || "[]"
          );

          setSystemStatus(prev => ({
            ...prev,
            localStorage: {
              pendingNotifications: pendingNotifications.length,
              localNotifications: localNotifications.length,
            },
          }));
        } catch (error) {
          console.error("Error checking local storage:", error);
        }
      }

      // Re-check API endpoints
      await checkApiEndpoints();
    } catch (error) {
      console.error("Error refreshing status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Notification System Status</h1>

      {loading && !user ? (
        <div className="text-center">Loading system status...</div>
      ) : !user ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Please log in to check the notification system status
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button onClick={refreshStatus} disabled={loading} className="col-span-1">
              Refresh Status
            </Button>

            <Button onClick={checkApiEndpoints} disabled={loading} className="col-span-1">
              Test API Endpoints
            </Button>

            <Button onClick={createTestNotification} disabled={loading} className="col-span-1">
              Create Test Notification
            </Button>

            <Button onClick={() => processPendingNotifications()} disabled={loading} className="col-span-1">
              Process Pending Notifications
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Environment Variables */}
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                  <span className={systemStatus.envVars.supabaseUrl ? "text-green-600" : "text-red-600"}>
                    {systemStatus.envVars.supabaseUrl ? "Available" : "Missing"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                  <span className={systemStatus.envVars.supabaseAnonKey ? "text-green-600" : "text-red-600"}>
                    {systemStatus.envVars.supabaseAnonKey ? "Available" : "Missing"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>NEXT_PUBLIC_SITE_URL:</span>
                  <span className={systemStatus.envVars.siteUrl ? "text-green-600" : "text-red-600"}>
                    {systemStatus.envVars.siteUrl ? "Available" : "Missing"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>NEXT_PUBLIC_ENABLE_NOTIFICATIONS:</span>
                  <span className={systemStatus.envVars.enableNotifications ? "text-green-600" : "text-red-600"}>
                    {systemStatus.envVars.enableNotifications ? "Enabled" : "Disabled"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>SUPABASE_SERVICE_ROLE_KEY:</span>
                  <span className="text-yellow-600">
                    (Cannot check from client)
                  </span>
                </li>
              </ul>
            </Card>

            {/* User Authentication */}
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">User Authentication</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Logged In:</span>
                  <span className={systemStatus.userAuth.isLoggedIn ? "text-green-600" : "text-red-600"}>
                    {systemStatus.userAuth.isLoggedIn ? "Yes" : "No"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>User ID:</span>
                  <span className="text-blue-600 truncate max-w-[250px]">
                    {systemStatus.userAuth.userId || "N/A"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-blue-600 truncate max-w-[250px]">
                    {systemStatus.userAuth.email || "N/A"}
                  </span>
                </li>
              </ul>
            </Card>

            {/* Database */}
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Database</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Supabase Connection:</span>
                  <span className={systemStatus.database.canConnectToSupabase ? "text-green-600" : "text-red-600"}>
                    {systemStatus.database.canConnectToSupabase ? "Connected" : "Failed"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Notifications Table:</span>
                  <span className={systemStatus.database.notificationsTableExists ? "text-green-600" : "text-red-600"}>
                    {systemStatus.database.notificationsTableExists ? "Exists" : "Missing"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>RLS Permissions:</span>
                  <span className={systemStatus.database.permissionsActive ? "text-green-600" : "text-red-600"}>
                    {systemStatus.database.permissionsActive ? "Working" : "Issue"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Test Insert:</span>
                  <span className={systemStatus.database.testInsertSuccessful ? "text-green-600" : "text-red-600"}>
                    {systemStatus.database.testInsertSuccessful ? "Successful" : "Failed"}
                  </span>
                </li>
              </ul>

              {systemStatus.database.testData && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Test Data:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(systemStatus.database.testData, null, 2)}
                  </pre>
                </div>
              )}
            </Card>

            {/* API Endpoints */}
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Test API:</span>
                  <span className={systemStatus.apiEndpoints.testApiEndpoint ? "text-green-600" : "text-red-600"}>
                    {systemStatus.apiEndpoints.testApiEndpoint ? "Working" : "Failed"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Notifications API:</span>
                  <span className={systemStatus.apiEndpoints.notificationsApiWorks ? "text-green-600" : "text-red-600"}>
                    {systemStatus.apiEndpoints.notificationsApiWorks ? "Working" : "Failed"}
                  </span>
                </li>
              </ul>

              {systemStatus.apiEndpoints.apiResponse && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">API Response:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(systemStatus.apiEndpoints.apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </Card>

            {/* Local Storage */}
            <Card className="p-4 md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Local Storage</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Pending Notifications:</span>
                  <span className={systemStatus.localStorage.pendingNotifications > 0 ? "text-yellow-600" : "text-green-600"}>
                    {systemStatus.localStorage.pendingNotifications}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Local Notifications:</span>
                  <span className={systemStatus.localStorage.localNotifications > 0 ? "text-blue-600" : "text-green-600"}>
                    {systemStatus.localStorage.localNotifications}
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <p className="font-semibold">Status Summary:</p>
            <p>
              {systemStatus.database.canConnectToSupabase &&
               systemStatus.database.notificationsTableExists &&
               systemStatus.database.testInsertSuccessful &&
               systemStatus.apiEndpoints.testApiEndpoint
                ? "✅ Notification system appears to be working properly!"
                : "❌ Notification system has issues that need attention."
              }
            </p>
            {(!systemStatus.database.canConnectToSupabase ||
              !systemStatus.database.notificationsTableExists ||
              !systemStatus.database.testInsertSuccessful ||
              !systemStatus.apiEndpoints.testApiEndpoint) && (
              <ul className="mt-2 list-disc list-inside">
                {!systemStatus.database.canConnectToSupabase && (
                  <li>Cannot connect to Supabase database. Check your environment variables.</li>
                )}
                {!systemStatus.database.notificationsTableExists && (
                  <li>Notifications table does not exist or is not accessible.</li>
                )}
                {!systemStatus.database.testInsertSuccessful && (
                  <li>Cannot insert notifications. Check RLS permissions.</li>
                )}
                {!systemStatus.apiEndpoints.testApiEndpoint && (
                  <li>API endpoints are not working. Check server implementation.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
