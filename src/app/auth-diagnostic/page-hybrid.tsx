"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/utils/supabase/client";

interface DiagnosticResult {
  userFromAuth: {
    id: string;
    email?: string;
    metadata: Record<string, unknown>;
  };
  userProfile: Record<string, unknown> | { error: string };
  dbConnectionStatus: string;
  timestamp: string;
}

export default function AuthDiagnostic() {
  const { user, loading: authLoading } = useAuth();
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function runDiagnostic() {
      console.log("[AuthDiagnostic] Starting diagnostic - user:", (user as any)?.email, "authLoading:", authLoading);

      // Wait for auth provider to finish loading before proceeding
      if (authLoading) {
        console.log("[AuthDiagnostic] Auth provider still loading, waiting...");
        return;
      }

      // If no user in auth context after loading, redirect to login
      if (!user) {
        console.log("[AuthDiagnostic] No user found, redirecting to login");
        router.push("/login");
        return;
      }      try {
        setLoading(true);
        console.log("[AuthDiagnostic] Client auth successful for user:", user?.email);
        
        const supabase = createClient();
        
        // Test database query
        const { data: userProfile, error } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", user.id)
          .single();        const result: DiagnosticResult = {
          userFromAuth: {
            id: user.id,
            email: user?.email,
            metadata: user.user_metadata,
          },
          userProfile: error ? { error: error.message } : userProfile,
          dbConnectionStatus: error ? "Failed" : "Success",
          timestamp: new Date().toISOString(),
        };

        console.log("[AuthDiagnostic] Diagnostic result:", result);
        setDiagnosticResult(result);
        setError(null);
      } catch (err) {
        console.error("[AuthDiagnostic] Error during diagnostic:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    runDiagnostic();
  }, [user, authLoading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Authentication Diagnostic</h1>
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Authentication Diagnostic</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">Diagnostic Failed</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Authentication Diagnostic</h1>
        
        {diagnosticResult && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-green-700">✅ Client-Side Authentication Successful</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">User Information:</h3>
                <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(diagnosticResult.userFromAuth, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Database Profile:</h3>
                <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(diagnosticResult.userProfile, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Database Connection:</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  diagnosticResult.dbConnectionStatus === "Success" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {diagnosticResult.dbConnectionStatus}
                </span>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Timestamp:</h3>
                <span className="text-slate-600">{diagnosticResult.timestamp}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
