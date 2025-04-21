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
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // In middleware, we can safely set cookies with each response
          response.cookies.set({
            name,
            value,
            // Apply consistent security defaults across the application
            ...options,
            httpOnly: true,
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
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
          });
        },
      },
    }
  );

  // This will update the auth cookies if needed
  await supabase.auth.getUser();

  return response;
}
