import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * Client-side authentication utilities that work with browser cookies
 */

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("sb-sogwgxkxuuvvvjbqlcdo-auth-token="));

  return cookie ? cookie.split("=")[1] : null;
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export function clearAuthToken(): void {
  if (typeof document === "undefined") return;

  // Clear the auth cookie
  document.cookie =
    "sb-sogwgxkxuuvvvjbqlcdo-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
    Cookie: document.cookie, // Include all cookies
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}

export function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function redirectToHome(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

/**
 * Utility function to safely get the authenticated user from server actions.
 * Handles invalid refresh tokens and other auth errors gracefully.
 * Only redirects on genuine authentication failures, not temporary network issues.
 */
export async function getAuthenticatedUser() {
  try {
    const supabase = await createClient();

    // First try to get the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // If we got a user successfully, return it
    if (user && !authError) {
      return user;
    }

    // Handle specific auth errors that require redirect
    if (authError) {
      console.error("[Auth] Authentication error:", authError.message);

      // Only redirect on genuine auth failures, not network issues
      if (
        authError.message.includes("Invalid Refresh Token") ||
        authError.message.includes("Refresh Token Not Found") ||
        authError.message.includes("JWT expired") ||
        authError.message.includes("session_not_found") ||
        authError.message.includes("invalid_grant")
      ) {
        console.log("[Auth] Invalid/expired token detected, attempting refresh...");

        // Try to refresh the session before giving up
        try {
          const {
            data: { session },
            error: refreshError,
          } = await supabase.auth.refreshSession();

          if (!refreshError && session?.user) {
            console.log("[Auth] Session refresh successful");
            return session.user;
          } else {
            console.log("[Auth] Session refresh failed, clearing session");
            // Only clear session after failed refresh
            try {
              await supabase.auth.signOut();
            } catch (signOutError) {
              console.error("[Auth] Error during signOut:", signOutError);
            }

            // Redirect to login with error message
            redirect(
              "/login?message=" +
                encodeURIComponent("Your session has expired. Please log in again.")
            );
          }
        } catch (refreshError) {
          console.error("[Auth] Error during session refresh:", refreshError);
          redirect(
            "/login?message=" + encodeURIComponent("Your session has expired. Please log in again.")
          );
        }
      } else {
        // For other errors (network issues, etc.), don't redirect immediately
        console.log("[Auth] Non-critical auth error, not redirecting:", authError.message);
        // Return null to let the calling code handle gracefully
        return null;
      }
    }

    // If no user and no error, it's likely not authenticated
    if (!user && !authError) {
      console.log("[Auth] No user found and no error, user likely not authenticated");
      redirect("/login?message=" + encodeURIComponent("Please log in to continue"));
    }

    return user;
  } catch (error) {
    console.error("[Auth] Unexpected error in getAuthenticatedUser:", error);
    redirect(
      "/login?message=" +
        encodeURIComponent("An authentication error occurred. Please log in again.")
    );
  }
}
