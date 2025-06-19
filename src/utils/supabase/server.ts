import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

/**
 * Creates a Supabase server client with proper cookie handling for Next.js server components,
 * server actions, and route handlers.
 *
 * This client follows Next.js best practices for cookie management with
 * graceful error handling to prevent crashes when cookies can't be set.
 */
export async function createClient() {
  // Hard-coded fallback values (only for development, not for production)
  const fallbackUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
  // Using anonymous key for authentication operations
  const fallbackAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs";

  // Use environment variables or fall back to hard-coded values
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  // Use anonymous key for authentication operations
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackAnonKey;

  console.log("[Server] Using ANONYMOUS KEY for authentication");
  console.log("[Server] Supabase URL:", supabaseUrl ? "defined" : "undefined");
  console.log("[Server] Anonymous Key:", supabaseKey ? "defined" : "undefined");

  // Get the cookie store once for the entire client creation - must await in Next.js 15+
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => {
        // Get cookie from cookieStore
        const cookie = cookieStore.get(name);
        console.log(`[Server] Getting cookie '${name}':`, cookie?.value ? "exists" : "missing");

        // If the main cookie doesn't exist, try alternate formats
        if (!cookie?.value && name.includes("auth-token")) {
          const altName1 = name + ".0"; // refresh token
          const altName2 = name + ".1"; // access token
          const altCookie1 = cookieStore.get(altName1);
          const altCookie2 = cookieStore.get(altName2);

          if (altCookie1?.value || altCookie2?.value) {
            console.log(`[Server] Found alternate auth cookies for '${name}'`);
            // Return the session data if we have tokens
            if (altCookie1?.value && altCookie2?.value) {
              const sessionData = {
                access_token: altCookie2.value,
                refresh_token: altCookie1.value,
                expires_in: 3600,
                token_type: "bearer",
                user: null,
              };
              return JSON.stringify(sessionData);
            }
          }
        }

        return cookie?.value;
      },
      set: (name) => {
        // In Next.js 15, cookies can only be set in Route Handlers and Server Actions
        // For server components, we skip cookie setting to avoid errors
        console.log(`[Server] Cookie setting skipped for '${name}' - not in Route Handler context`);
      },
      remove: (name) => {
        // In Next.js 15, cookies can only be removed in Route Handlers and Server Actions
        // For server components, we skip cookie removal to avoid errors
        console.log(`[Server] Cookie removal skipped for '${name}' - not in Route Handler context`);
      },
    },
  });
}

// Create server client for data operations (uses service role key to bypass RLS)
export async function createServiceClient() {
  const fallbackUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
  const fallbackServiceKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackServiceKey;

  console.log("[ServerService] Using SERVICE ROLE to bypass RLS");

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => {
        const cookie = cookieStore.get(name);
        return cookie?.value;
      },
      set: (name, value, options) => {
        try {
          cookieStore.set({
            name,
            value,
            ...options,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
          });
        } catch (error) {
          console.warn(`Cookie '${name}' could not be set:`, error);
        }
      },
      remove: (name, options) => {
        try {
          cookieStore.set({
            name,
            value: "",
            ...options,
            expires: new Date(0),
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
          });
        } catch (error) {
          console.warn(`Cookie '${name}' could not be removed:`, error);
        }
      },
    },
  });
}
