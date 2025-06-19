import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    console.log("[Session Check] Checking current session...");

    // First, let's see what cookies we have
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieList = allCookies.map((cookie) => `${cookie.name}=${cookie.value}`);

    console.log("[Session Check] All cookies received:", cookieList);
    console.log(
      "[Session Check] Auth cookies:",
      cookieList.filter((c) => c.includes("sb-"))
    );

    const supabase = await createClient();

    // Check if we can read the session from cookies
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    console.log("[Session Check] Session result:", { session: !!session, error: sessionError });

    // Also check user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("[Session Check] User result:", {
      user: !!user,
      email: user?.email,
      error: userError,
    });
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      hasUser: !!user,
      user: user,
      session: session,
      cookies: cookieList,
      errors: {
        sessionError: sessionError?.message,
        userError: userError?.message,
      },
    });
  } catch (error) {
    console.error("[Session Check] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
