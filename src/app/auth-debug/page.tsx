"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface DebugInfo {
  session: any;
  user: any;
  cookies: string[];
  errors: string[];
}

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    session: null,
    user: null,
    cookies: [],
    errors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function debugAuth() {
      const supabase = createClient();
      const errors: string[] = [];
      let session = null;
      let user = null;

      try {
        // Check session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          errors.push(`Session error: ${sessionError.message}`);
        } else {
          session = sessionData.session;
        }

        // Check user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          errors.push(`User error: ${userError.message}`);
        } else {
          user = userData.user;
        }

      } catch (error) {
        errors.push(`General error: ${error}`);
      }

      // Get cookies
      const cookies = document.cookie.split(';').map(c => c.trim());

      setDebugInfo({
        session,
        user,
        cookies,
        errors
      });
      setLoading(false);
    }

    debugAuth();
  }, []);

  if (loading) {
    return <div className="p-8">Loading auth debug info...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Information</h1>

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Errors</h2>
          {debugInfo.errors.length > 0 ? (
            <ul className="list-disc pl-5 text-red-600">
              {debugInfo.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600">No errors</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">User</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo.user, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Session</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo.session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Cookies</h2>
          <ul className="list-disc pl-5">
            {debugInfo.cookies.map((cookie, i) => (
              <li key={i} className="text-sm font-mono">{cookie}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
