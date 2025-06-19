import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

/**
 * Creates a Supabase server client with proper cookie handling for Next.js server components,
 * server actions, and route handlers.
 *
 * This client follows Next.js best practices for cookie management with
 * graceful error handling to prevent crashes when cookies can't be set.
 *
 * @param context - Optional context for debugging purposes
 */
export async function createClient(context?: string) {
  // Hard-coded fallback values (only for development, not for production)
  const fallbackUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
  // Using anonymous key for authentication operations
  const fallbackAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs";

  // Use environment variables or fall back to hard-coded values
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  // Use anonymous key for authentication operations
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackAnonKey;

  console.log("[Server] Creating Supabase server client");
  console.log("[Server] Context:", context || "default");

  // Get the cookie store once for the entire client creation
  const cookieStore = await cookies();

  const client = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => {
        return cookieStore.get(name)?.value;
      },
      set: (name, value, options) => {
        try {
          // Next.js only allows cookie modifications in Server Actions and Route Handlers
          cookieStore.set({
            name,
            value,
            // Apply consistent security defaults
            ...options,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            // Extend expiration for better session persistence
            maxAge: options?.maxAge || 60 * 60 * 24 * 7, // 7 days default
          });
        } catch (error) {
          // Gracefully handle cookie set errors without breaking the application
          console.warn(`Cookie '${name}' could not be set:`, error);
        }
      },
      remove: (name, options) => {
        try {
          // Removing cookies is done by setting an expired cookie
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
          // Gracefully handle cookie remove errors
          console.warn(`Cookie '${name}' could not be removed:`, error);
        }
      },
    },
  });

  return client;
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
