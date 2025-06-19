"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SessionTestPage() {
  const { user, session, loading, refreshAuth } = useAuth();
  const router = useRouter();

  const testPages = [
    { path: "/", label: "Home" },
    { path: "/login", label: "Login" },
    { path: "/profile", label: "Profile" },
    { path: "/messages", label: "Messages" },
    { path: "/sessions", label: "Sessions" },
    { path: "/session-test", label: "Session Test (current)" }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🧪 Session Persistence Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Auth State:</h3>
            <div className="bg-gray-100 p-3 rounded">
              <div>Loading: {loading ? "🔄 Yes" : "✅ No"}</div>
              <div>User: {user ? `✅ ${user.email}` : "❌ None"}</div>
              <div>Session: {session ? "✅ Active" : "❌ None"}</div>
              {session && (
                <div className="text-sm text-gray-600 mt-1">
                  Expires: {new Date(session.expires_at! * 1000).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Navigation Test:</h3>
            <p className="text-sm text-gray-600 mb-3">
              Click these links to test if your session persists across page navigation:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {testPages.map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="bg-blue-100 hover:bg-blue-200 p-2 rounded text-center text-sm transition-colors"
                >
                  {page.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Manual Tests:</h3>
            <div className="space-y-2">
              <Button
                onClick={refreshAuth}
                variant="outline"
                className="w-full"
              >
                🔄 Refresh Auth State
              </Button>
              
              <Button
                onClick={() => router.refresh()}
                variant="outline"
                className="w-full"
              >
                🔄 Refresh Page (router.refresh)
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                🔄 Hard Reload (window.location.reload)
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Browser Console Tests:</h3>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              <div>// Check auth debug info:</div>
              <div>window.authDebugInfo</div>
              <div className="mt-2">// Run session test:</div>
              <div>window.testSessionPersistence()</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>If not logged in, go to <Link href="/login" className="text-blue-600 underline">/login</Link> first</li>
              <li>Come back to this page and verify your auth state shows "User: ✅"</li>
              <li>Click the navigation links above</li>
              <li>Check if you get prompted to login again (you shouldn&apos;t)</li>
              <li>Try the manual refresh buttons</li>
              <li>Open browser dev tools and check for any auth errors</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
