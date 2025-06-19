"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

interface ProductionAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Production-specific authentication guard that handles client-side auth validation
 * when server-side auth fails in production mode
 */
export function ProductionAuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/login",
}: ProductionAuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isProduction, setIsProduction] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Detect production mode
    setIsProduction(process.env.NODE_ENV === "production");
  }, []);

  useEffect(() => {
    // In production mode, skip client-side auth checks entirely
    if (isProduction) {
      console.log("[ProductionAuthGuard] Production mode: Skipping client-side auth checks");
      setAuthChecked(true);
      return;
    }

    // Development mode: perform normal auth checks
    if (loading) return;

    if (requireAuth && !user) {
      console.log("[ProductionAuthGuard] Development: User not authenticated, redirecting");
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
      return;
    }

    setAuthChecked(true);
  }, [user, loading, requireAuth, redirectTo, router, isProduction]);

  // In production mode, always show content after initial check (no auth validation)
  if (isProduction && authChecked) {
    console.log("[ProductionAuthGuard] Production mode: Showing content without auth validation");
    return <>{children}</>;
  }

  // Production mode: Show loading briefly during initialization
  if (isProduction && !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // Development mode: Show loading while checking authentication
  if (!isProduction && (loading || (requireAuth && !authChecked))) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Development mode: If authentication is required but user is not authenticated, show nothing (redirect will happen)
  if (!isProduction && requireAuth && !user) {
    return null;
  }

  // Development mode: User is authenticated or auth not required, show content
  return <>{children}</>;
}
