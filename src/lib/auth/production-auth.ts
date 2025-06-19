"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * Production-specific authentication helper that handles session retrieval more robustly
 */
export async function getProductionAuthSession() {
  try {
    const supabase = await createClient();

    // Try multiple methods to get the session in production
    // Method 1: Try getSession first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionData?.session?.user) {
      console.log("[Production Auth] Session retrieved successfully via getSession");
      return {
        user: sessionData.session.user,
        session: sessionData.session,
        error: null,
      };
    }

    // Method 2: Try getUser as fallback
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userData?.user) {
      console.log("[Production Auth] User retrieved successfully via getUser");
      return {
        user: userData.user,
        session: sessionData?.session || null,
        error: null,
      };
    }

    // Method 3: Check cookies directly for debugging
    const cookieStore = await cookies();
    const authCookies = cookieStore
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-") || cookie.name.includes("supabase"));

    console.warn("[Production Auth] Authentication failed", {
      sessionError: sessionError?.message,
      userError: userError?.message,
      cookieCount: authCookies.length,
      cookieNames: authCookies.map((c) => c.name),
      timestamp: new Date().toISOString(),
    });

    return {
      user: null,
      session: null,
      error: sessionError || userError || new Error("No authentication found"),
    };
  } catch (error) {
    console.error("[Production Auth] Critical authentication error:", error);
    return {
      user: null,
      session: null,
      error: error as Error,
    };
  }
}

/**
 * Enhanced server page wrapper specifically for production authentication issues
 */
export async function withProductionAuth<T>(
  pageComponent: (user: any, supabase: any) => Promise<T>,
  fallbackRedirect = "/login?message=Authentication required"
): Promise<T> {
  const { user, session, error } = await getProductionAuthSession();

  if (!user) {
    // In production, we need to handle this differently
    // since we can't redirect from server components
    console.warn("[Production Auth] User not authenticated, should redirect to:", fallbackRedirect);

    // Create a simple fallback client for unauthenticated requests
    const supabase = await createClient();

    // Return a special indicator that the page should handle the redirect
    throw new Error(`REDIRECT:${fallbackRedirect}`);
  }

  console.log("[Production Auth] User authenticated successfully:", user.id);

  // Create authenticated client
  const supabase = await createClient();

  return await pageComponent(user, supabase);
}
