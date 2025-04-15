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
  // Get the cookie store once for the entire client creation
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // Simple get operation is safe in all contexts
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
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
            });
          } catch (error) {
            // Gracefully handle cookie set errors without breaking the application
            console.warn(`Cookie '${name}' could not be set:`, error);
          }
        },
        remove(name, options) {
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
            // Gracefully handle cookie removal errors
            console.warn(`Cookie '${name}' could not be removed:`, error);
          }
        },
      },
    }
  );
}

export default createClient;
