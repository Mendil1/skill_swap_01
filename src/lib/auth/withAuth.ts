/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Authentication wrapper for server-side components.
 * Note: Most pages now use client-side auth for better user experience.
 */
export async function withAuth<T>(
  callback: (user: any, supabase: any) => Promise<T>,
  options: {
    redirectTo?: string;
    allowUnauthenticated?: boolean;
    debugMode?: boolean;
  } = {}
): Promise<T> {
  const {
    redirectTo = "/login",
    allowUnauthenticated = false,
    debugMode = process.env.NODE_ENV === "development",
  } = options;

  try {
    const supabase = await createClient();

    if (debugMode) {
      console.log("[withAuth] Creating server client...");
    }

    // Get authentication state with enhanced error handling
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (debugMode) {
      console.log("[withAuth] Session check:", {
        hasSession: !!session,
        sessionError: sessionError?.message,
        userId: session?.user?.id,
      });
    }

    let user = session?.user || null;

    // If no session, try to get user directly (fallback)
    if (!user && !sessionError) {
      const {
        data: { user: directUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (debugMode) {
        console.log("[withAuth] Direct user check:", {
          hasUser: !!directUser,
          userError: userError?.message,
          userId: directUser?.id,
        });
      }

      user = directUser;
    }

    // Handle unauthenticated state
    if (!user) {
      if (allowUnauthenticated) {
        if (debugMode) {
          console.log("[withAuth] Proceeding without authentication (allowed)");
        }
        return await callback(null, supabase);
      }

      // Get current headers for debugging
      const headersList = await headers();
      const userAgent = headersList.get("user-agent");
      const cookieHeader = headersList.get("cookie");

      if (debugMode) {
        console.log("[withAuth] Authentication failed, redirecting:", {
          redirectTo,
          userAgent: userAgent?.substring(0, 50) + "...",
          hasCookies: !!cookieHeader,
          cookieCount: cookieHeader?.split(";").length || 0,
        });
      }

      // Log authentication failure for production debugging
      console.warn(`[AUTH_FAILURE] User not authenticated, redirecting to ${redirectTo}`, {
        sessionError: sessionError?.message,
        timestamp: new Date().toISOString(),
        hasSession: !!session,
        cookiesPresent: !!cookieHeader,
      });

      redirect(redirectTo);
    }

    if (debugMode) {
      console.log("[withAuth] Authentication successful, executing callback");
    }

    // Execute the callback with authenticated user
    return await callback(user, supabase);
  } catch (error) {
    console.error("[withAuth] Unexpected error:", error);

    if (allowUnauthenticated) {
      // Try to proceed without auth if allowed
      const supabase = await createClient();
      return await callback(null, supabase);
    }

    // For critical errors, redirect to login
    redirect(redirectTo + "?message=Authentication error occurred");
  }
}

/**
 * Helper function specifically for server actions that need authentication
 */
export async function withServerActionAuth<T>(
  callback: (user: any, supabase: any) => Promise<T>
): Promise<T> {
  return withAuth(callback, {
    redirectTo: "/login?message=Please log in to continue",
    allowUnauthenticated: false,
    debugMode: true, // Always debug server actions
  });
}

/**
 * Helper function for pages that can work with or without authentication
 */
export async function withOptionalAuth<T>(
  callback: (user: any | null, supabase: any) => Promise<T>
): Promise<T> {
  return withAuth(callback, {
    allowUnauthenticated: true,
    debugMode: process.env.NODE_ENV === "development",
  });
}
