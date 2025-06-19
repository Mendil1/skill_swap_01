import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/supabase";

/**
 * Updates the user session in the middleware - this runs on every request.
 * Handles cookie management for Supabase auth across the application.
 */
export async function updateSession(request: NextRequest) {
  // Create a response that we'll modify with cookies
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  // Create a Supabase client specifically for the middleware context
  // Hard-coded fallback values (only for development, not for production)
  const fallbackUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
  // Using anonymous key for authentication operations in middleware
  const fallbackAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs";

  // Use environment variables or fall back to hard-coded values
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  // Use anonymous key for authentication operations in middleware
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackAnonKey;

  console.log("[Middleware] Using ANONYMOUS KEY for authentication");
  console.log("[Middleware] Supabase URL:", supabaseUrl ? "defined" : "undefined");
  console.log("[Middleware] Anonymous Key:", supabaseKey ? "defined" : "undefined");

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // In middleware, we can safely set cookies with each response
        // IMPORTANT: Don't use httpOnly for Supabase auth cookies as they need client access

        response.cookies.set({
          name,
          value,
          // Apply consistent security defaults across the application
          ...options,
          httpOnly: false, // Critical: Auth cookies need client-side access
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
      },
      remove(name: string, options: CookieOptions) {
        // Removing cookies by setting an expired date
        response.cookies.set({
          name,
          value: "",
          ...options,
          expires: new Date(0),
          httpOnly: false, // Consistent with set behavior
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
      },
    },
  });

  // This will update the auth cookies if needed
  await supabase.auth.getUser();

  return response;
}
