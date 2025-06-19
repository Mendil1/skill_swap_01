"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthClearPage() {
  const [status, setStatus] = useState("ready");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(`[AuthClear] ${message}`);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearAllAuth = async () => {
    setStatus("clearing");
    setLogs([]);
    
    try {
      addLog("Starting complete auth clear...");

      // 1. Clear Supabase auth
      const supabase = createClient();
      addLog("Signing out of Supabase...");
      await supabase.auth.signOut();

      // 2. Clear localStorage
      addLog("Clearing localStorage...");
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth') || key.includes('sb-')
      );
      addLog(`Found ${authKeys.length} auth keys in localStorage`);
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        addLog(`Removed: ${key}`);
      });

      // 3. Clear sessionStorage
      addLog("Clearing sessionStorage...");
      const sessionAuthKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('supabase') || key.includes('auth') || key.includes('sb-')
      );
      addLog(`Found ${sessionAuthKeys.length} auth keys in sessionStorage`);
      sessionAuthKeys.forEach(key => {
        sessionStorage.removeItem(key);
        addLog(`Removed: ${key}`);
      });

      // 4. Clear cookies (what we can access)
      addLog("Clearing accessible cookies...");
      const cookies = document.cookie.split(';');
      let clearedCookies = 0;
      
      cookies.forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name.includes('sb-') || name.includes('supabase') || name.includes('auth')) {
          // Try to clear the cookie
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          clearedCookies++;
          addLog(`Cleared cookie: ${name}`);
        }
      });
      
      addLog(`Attempted to clear ${clearedCookies} cookies`);

      // 5. Force clear via server route
      addLog("Calling server force-logout...");
      try {
        const response = await fetch('/auth/force-logout', { method: 'POST' });
        if (response.ok) {
          addLog("Server force-logout successful");
        } else {
          addLog(`Server force-logout failed: ${response.status}`);
        }
      } catch (err) {
        addLog(`Server force-logout error: ${err}`);
      }

      setStatus("cleared");
      addLog("✅ Auth clear complete! Reload the page to test.");

    } catch (error) {
      addLog(`❌ Error during auth clear: ${error}`);
      setStatus("error");
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const checkAuthState = async () => {
    addLog("Checking current auth state...");
    
    // Check localStorage
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth') || key.includes('sb-')
    );
    addLog(`localStorage auth keys: ${authKeys.length}`);
    authKeys.forEach(key => addLog(`  - ${key}`));

    // Check cookies
    const authCookies = document.cookie.split(';').filter(c => 
      c.includes('sb-') || c.includes('supabase') || c.includes('auth')
    );
    addLog(`Auth cookies: ${authCookies.length}`);
    authCookies.forEach(cookie => addLog(`  - ${cookie.trim().split('=')[0]}`));

    // Check Supabase session
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`Supabase session error: ${error.message}`);
      } else if (data.session) {
        addLog(`Supabase session: ${data.session.user.email}`);
      } else {
        addLog("Supabase session: none");
      }
    } catch (err) {
      addLog(`Supabase session check failed: ${err}`);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🧹 Auth State Cleaner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            Use this tool to completely clear authentication state when experiencing login/redirect issues.
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={clearAllAuth} 
              disabled={status === "clearing"}
              variant={status === "cleared" ? "outline" : "default"}
            >
              {status === "clearing" ? "Clearing..." : "🧹 Clear All Auth"}
            </Button>
            
            <Button onClick={checkAuthState} variant="outline">
              🔍 Check Auth State
            </Button>
            
            <Button onClick={reloadPage} variant="outline">
              🔄 Reload Page
            </Button>
          </div>

          {status === "cleared" && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="font-semibold text-green-800">✅ Auth Cleared Successfully</div>
              <div className="text-sm text-green-700">
                Now reload the page and try logging in again. The redirect issue should be fixed.
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="font-semibold text-red-800">❌ Error During Clear</div>
              <div className="text-sm text-red-700">
                Check the logs below for details.
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded p-3">
            <div className="font-semibold mb-2">Activity Log:</div>
            <div className="text-sm font-mono space-y-1 max-h-60 overflow-y-auto">
              {logs.length === 0 && <div className="text-gray-500">No activity yet...</div>}
              {logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">{log}</div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="font-semibold mb-2">Instructions:</div>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Click "Clear All Auth" to remove all authentication data</li>
              <li>Click "Reload Page" to refresh the application</li>
              <li>Try visiting /login - it should work without redirecting</li>
              <li>Test creating a new account or logging in</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
