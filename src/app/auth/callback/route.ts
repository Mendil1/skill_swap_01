import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[Auth Callback] Processing authentication callback");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  console.log("[Auth Callback] Code present:", !!code);
  console.log("[Auth Callback] Next redirect:", next);

  if (code) {
    try {
      const supabase = await createClient();

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[Auth Callback] Session exchange error:", error);
        return NextResponse.redirect(
          new URL(
            `/login?message=${encodeURIComponent("Authentication failed: " + error.message)}`,
            requestUrl.origin
          )
        );
      }

      console.log("[Auth Callback] Session exchange successful");
      console.log("[Auth Callback] User ID:", data.user?.id);
      console.log("[Auth Callback] Session exists:", !!data.session);

      // Successful authentication - redirect to the next page
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (error) {
      console.error("[Auth Callback] Unexpected error:", error);
      return NextResponse.redirect(
        new URL(`/login?message=${encodeURIComponent("Authentication failed")}`, requestUrl.origin)
      );
    }
  }

  // No code present - redirect to login
  console.log("[Auth Callback] No code parameter found");
  return NextResponse.redirect(
    new URL("/login?message=Authentication code missing", requestUrl.origin)
  );
}
