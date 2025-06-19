"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

interface AuthRedirectHandlerProps {
  redirectTo: string;
  children: React.ReactNode;
}

/**
 * Client-side component that handles authentication redirects in production
 * when server-side authentication fails
 */
export function AuthRedirectHandler({ redirectTo, children }: AuthRedirectHandlerProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log("[AuthRedirectHandler] User not authenticated, redirecting to:", redirectTo);
      router.push(redirectTo);
    }
  }, [user, loading, redirectTo, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no user, show nothing (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated, show the page content
  return <>{children}</>;
}
