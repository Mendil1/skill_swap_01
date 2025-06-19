"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

interface UseAuthRedirectOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { redirectTo = "/login", requireAuth = true } = options;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      console.log("Auth required but no user found, redirecting to:", redirectTo);
      router.push(redirectTo);
      return;
    }

    if (!requireAuth && user && redirectTo === "/login") {
      // If user is logged in and trying to access login page, redirect to home
      console.log("User already logged in, redirecting to home");
      router.push("/");
      return;
    }

    setIsChecking(false);
  }, [user, loading, requireAuth, redirectTo, router]);

  return {
    user,
    loading: loading || isChecking,
    isAuthenticated: !!user,
  };
}

export function useAuthStatus() {
  const { user, session, loading } = useAuth();

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isLoggedIn: !!user,
  };
}
