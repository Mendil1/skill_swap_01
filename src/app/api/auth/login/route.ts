import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    console.log("[Auth Route] Attempting login for:", email);

    const supabase = await createClient();

    // Attempt to sign in
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Auth Route] Login failed:", error.message);
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 401 }
      );
    }

    console.log("[Auth Route] Login successful for user:", authData?.user?.email);

    // Get the session to ensure it's established
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("[Auth Route] Session establishment failed:", sessionError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to establish session",
        },
        { status: 500 }
      );
    }
    console.log("[Auth Route] Session established:", !!sessionData.session);
    console.log("[Auth Route] Access token exists:", !!sessionData.session?.access_token);
    console.log("[Auth Route] Refresh token exists:", !!sessionData.session?.refresh_token);

    // Set the main session cookies that Supabase expects
    const session = sessionData.session;
    const cookieOptions = {
      path: "/",
      secure: false, // localhost, so not secure
      sameSite: "lax" as const,
      httpOnly: false, // Allow client-side access
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    // Set multiple cookie formats to ensure compatibility
    const baseName = "sb-sogwgxkxuuvvvjbqlcdo-auth-token";
    const refreshName = "sb-sogwgxkxuuvvvjbqlcdo-auth-token.0";
    const accessName = "sb-sogwgxkxuuvvvjbqlcdo-auth-token.1";

    console.log("[Auth Route] Setting cookies with names:", { baseName, refreshName, accessName });

    // Create response with success data
    const response = NextResponse.json({
      success: true,
      user: authData.user,
      redirectTo: "/",
      message: "Login successful",
    });

    // Set the session cookies manually in the response
    response.cookies.set(baseName, JSON.stringify(session), cookieOptions);
    response.cookies.set(refreshName, session.refresh_token, cookieOptions);
    response.cookies.set(accessName, session.access_token, cookieOptions);

    // Also set a simple auth flag cookie
    response.cookies.set("authenticated", "true", cookieOptions);

    console.log("[Auth Route] All cookies set, returning response");

    return response;
  } catch (error) {
    console.error("[Auth Route] Unexpected error:", error);
    return NextResponse.redirect(
      new URL("/login?message=An unexpected error occurred", request.url)
    );
  }
}
