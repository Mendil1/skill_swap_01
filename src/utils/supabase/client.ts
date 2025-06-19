import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

// Create client for authentication operations (uses anonymous key)
export function createClient() {
  const fallbackUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
  const fallbackAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs";

  // Use anonymous key for authentication operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackAnonKey;

  console.log("[Client] Using ANONYMOUS KEY for authentication");
  console.log("[Client] Supabase URL:", supabaseUrl ? "defined" : "undefined");
  console.log("[Client] Anonymous Key:", supabaseKey ? "defined" : "undefined");
  return createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => {
        // Use document.cookie to get cookies on the client side
        if (typeof document === "undefined") return undefined;

        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const [key, value] = cookie.trim().split("=");
          if (key === name) {
            console.log(`[Client] Getting cookie '${name}': exists`);
            return decodeURIComponent(value);
          }
        }
        console.log(`[Client] Getting cookie '${name}': missing`);
        return undefined;
      },
      set: (name, value, options) => {
        if (typeof document === "undefined") return;

        console.log(`[Client] Setting cookie '${name}'`);
        let cookieString = `${name}=${encodeURIComponent(value)}`; // Production-optimized cookie settings
        if (options?.maxAge) {
          cookieString += `; max-age=${options.maxAge}`;
        } else {
          // Default to 7 days for auth tokens
          cookieString += `; max-age=${7 * 24 * 60 * 60}`;
        }

        cookieString += `; path=${options?.path || "/"}`;
        cookieString += `; samesite=${options?.sameSite || "lax"}`; // Production domain handling
        if (typeof window !== "undefined") {
          const hostname = window.location.hostname;
          const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

          // Only set domain for non-localhost environments
          if (!isLocalhost && options?.domain) {
            cookieString += `; domain=${options.domain}`;
          }

          // Don't set secure flag for localhost (even in production mode)
          if (!isLocalhost && (process.env.NODE_ENV === "production" || options?.secure)) {
            cookieString += `; secure`;
          }
        }

        console.log(`[Client] Cookie string: ${cookieString}`);
        document.cookie = cookieString;
      },
      remove: (name, options) => {
        if (typeof document === "undefined") return;

        console.log(`[Client] Removing cookie '${name}'`);
        let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

        cookieString += `; path=${options?.path || "/"}`;

        if (options?.domain) {
          cookieString += `; domain=${options.domain}`;
        }

        document.cookie = cookieString;
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

// Create client for data operations (uses service role key to bypass RLS)
export function createServiceClient() {
  const fallbackUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
  const fallbackServiceKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8";

  // Use service role key to bypass all RLS policies for data operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackServiceKey;

  console.log("[ServiceClient] Using SERVICE ROLE to bypass RLS");

  return createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}
