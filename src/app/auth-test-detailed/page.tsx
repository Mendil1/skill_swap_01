"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AuthTestDetailed() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const supabase = createClient();
    const testResults: any = {};

    try {
      // Test 1: Check current session
      console.log("=== AUTH TEST 1: Getting Session ===");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      testResults.session = {
        data: sessionData,
        error: sessionError,
        user: sessionData?.session?.user || null,
        hasSession: !!sessionData?.session
      };
      console.log("Session result:", testResults.session);

      // Test 2: Check current user
      console.log("=== AUTH TEST 2: Getting User ===");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      testResults.user = {
        data: userData,
        error: userError,
        hasUser: !!userData?.user
      };
      console.log("User result:", testResults.user);

      // Test 3: Test sign in with dummy credentials (will fail but shows flow)
      console.log("=== AUTH TEST 3: Testing Sign In Flow ===");
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "testpassword"
      });
      testResults.signIn = {
        data: signInData,
        error: signInError,
        errorMessage: signInError?.message
      };
      console.log("Sign in test result:", testResults.signIn);

      // Test 4: Check if cookies are being set
      console.log("=== AUTH TEST 4: Checking Cookies ===");
      const cookieString = document.cookie;
      testResults.cookies = {
        all: cookieString,
        supabaseAuth: cookieString.includes("supabase"),
        authToken: cookieString.includes("auth-token"),
        accessToken: cookieString.includes("access_token")
      };
      console.log("Cookie result:", testResults.cookies);

    } catch (error) {
      console.error("Test error:", error);
      testResults.globalError = error;
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Detailed Authentication Test</h1>

      <button
        onClick={runTests}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-6"
      >
        {loading ? "Running Tests..." : "Run Authentication Tests"}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results:</h2>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Session Test:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results.session, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">User Test:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results.user, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Sign In Test:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results.signIn, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Cookies Test:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results.cookies, null, 2)}
            </pre>
          </div>

          {results.globalError && (
            <div className="bg-red-100 p-4 rounded">
              <h3 className="font-semibold mb-2 text-red-700">Global Error:</h3>
              <pre className="text-sm overflow-auto text-red-600">
                {JSON.stringify(results.globalError, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
