"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function AuthSyncPage() {
  const { refreshAuth, loading } = useAuth();
  const router = useRouter();
  const [syncCompleted, setSyncCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRedirected = useRef(false); // Prevent multiple redirects

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      if (syncCompleted || hasRedirected.current) return;

      console.log("[AuthSync] Starting session synchronization...");

      try {
        // Force a session refresh on the client side
        await refreshAuth();

        // Wait a bit for the session to be established
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (isMounted && !hasRedirected.current) {
          setSyncCompleted(true);
          hasRedirected.current = true;
          console.log("[AuthSync] Session sync complete, redirecting to home...");
          router.replace("/");
        }
      } catch (error) {
        console.error("[AuthSync] Error during sync:", error);
        if (isMounted && !hasRedirected.current) {
          setError("Authentication sync failed. Redirecting anyway...");
          hasRedirected.current = true;
          router.replace("/");
        }
      }
    };

    // Safety timeout - always redirect after 5 seconds to prevent getting stuck
    const timeoutId = setTimeout(() => {
      if (isMounted && !hasRedirected.current) {
        console.log("[AuthSync] Timeout reached, forcing redirect...");
        hasRedirected.current = true;
        router.replace("/");
      }
    }, 5000);

    // Only run sync if we haven't completed it yet and auth provider is ready
    if (!syncCompleted && !loading && !hasRedirected.current) {
      syncSession();
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [refreshAuth, router, syncCompleted, loading]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Synchronizing authentication...</p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <p className="mt-2 text-xs text-gray-400">This should only take a moment...</p>
      </div>
    </div>
  );
}
