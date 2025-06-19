"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Cookie } from "lucide-react";

interface AuthDebugInfo {
  hasSession: boolean;
  hasUser: boolean;
  sessionValid: boolean;
  cookiesPresent: string[];
  environment: string;
  timestamp: string;
  error?: string;
}

export default function ProductionAuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const runDiagnostics = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      console.log("[Auth Debug] Starting diagnostics...");

      // Check session with more detailed logging
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("[Auth Debug] Session check:", { session: !!session, error: sessionError });

      // Check user with more detailed logging
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("[Auth Debug] User check:", {
        user: !!user,
        email: user?.email,
        error: userError,
      });

      // Check cookies
      const cookiesPresent = [];
      if (typeof document !== "undefined") {
        const allCookies = document.cookie;
        console.log("[Auth Debug] All cookies:", allCookies);

        const cookies = allCookies.split(";");
        for (const cookie of cookies) {
          const name = cookie.trim().split("=")[0];
          if (name.includes("sb-") || name.includes("auth")) {
            cookiesPresent.push(name);
          }
        }
        console.log("[Auth Debug] Auth cookies found:", cookiesPresent);
      }

      const info: AuthDebugInfo = {
        hasSession: !!session,
        hasUser: !!user,
        sessionValid: !!session && !!user && !sessionError && !userError,
        cookiesPresent,
        environment: process.env.NODE_ENV || "unknown",
        timestamp: new Date().toISOString(),
        error: sessionError?.message || userError?.message,
      };

      setDebugInfo(info);

      console.log("[Auth Debug] Full diagnostics:", {
        session: session ? "present" : "missing",
        user: user ? "present" : "missing",
        sessionError,
        userError,
        cookies: cookiesPresent,
      });
    } catch (error) {
      setDebugInfo({
        hasSession: false,
        hasUser: false,
        sessionValid: false,
        cookiesPresent: [],
        environment: process.env.NODE_ENV || "unknown",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const StatusIcon = ({ condition }: { condition: boolean }) =>
    condition ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Auth Debug</h1>
              <p className="text-gray-600">Diagnose authentication issues in production</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={runDiagnostics}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Diagnostics
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {debugInfo && (
            <>
              {/* Overall Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StatusIcon condition={debugInfo.sessionValid} />
                    Authentication Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon condition={debugInfo.hasSession} />
                      <span>Session Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon condition={debugInfo.hasUser} />
                      <span>User Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon condition={debugInfo.sessionValid} />
                      <span>Auth Valid</span>
                    </div>
                  </div>

                  {debugInfo.error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-sm font-medium text-red-800">Error:</p>
                      <p className="text-sm text-red-600">{debugInfo.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Environment Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Environment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Environment:</span>
                      <Badge
                        variant={debugInfo.environment === "production" ? "default" : "secondary"}
                      >
                        {debugInfo.environment}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Timestamp:</span>
                      <span className="text-sm text-gray-600">{debugInfo.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Browser Location:</span>
                      <span className="text-sm text-gray-600">
                        {typeof window !== "undefined" ? window.location.origin : "SSR"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cookies Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cookie className="h-5 w-5" />
                    Authentication Cookies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {debugInfo.cookiesPresent.length > 0 ? (
                    <div className="space-y-2">
                      <p className="mb-3 text-sm text-gray-600">
                        Found {debugInfo.cookiesPresent.length} auth-related cookie(s):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {debugInfo.cookiesPresent.map((cookie, index) => (
                          <Badge key={index} variant="outline" className="font-mono text-xs">
                            {cookie}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>No auth cookies found!</strong> This is likely why authentication is
                        failing in production.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Troubleshooting */}
              <Card>
                <CardHeader>
                  <CardTitle>Troubleshooting Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {!debugInfo.sessionValid && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-800">
                          Authentication Issues Detected:
                        </h4>
                        <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                          {!debugInfo.hasSession && (
                            <li>No session found - user may need to log in again</li>
                          )}
                          {!debugInfo.hasUser && (
                            <li>No user data available - session may be invalid</li>
                          )}
                          {debugInfo.cookiesPresent.length === 0 && (
                            <li>
                              No auth cookies present - check cookie settings and httpOnly flags
                            </li>
                          )}
                          {debugInfo.environment === "production" && (
                            <li>Production environment - check secure cookie settings and HTTPS</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">General Steps:</h4>
                      <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600">
                        <li>Try logging out and logging back in</li>
                        <li>Clear browser cookies and cache</li>
                        <li>Check that cookies are not set with httpOnly=true</li>
                        <li>Verify environment variables are correctly set</li>
                        <li>Check middleware cookie configuration</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
