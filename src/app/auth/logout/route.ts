import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("[Logout Route] Received sign-out request");
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();
  console.log("[Logout Route] Cookie store retrieved");

  const supabase = await createClient();
  console.log("[Logout Route] Supabase client created");

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[Logout Route] Error signing out:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Could not sign out`,
      { status: 302 }
    );
  }
  console.log("[Logout Route] Supabase signOut successful");

  const allCookies = cookieStore.getAll();
  console.log(`[Logout Route] Found ${allCookies.length} cookies to clear`);
  allCookies.forEach((cookie) => {
    console.log(`[Logout Route] Clearing cookie: ${cookie.name}`);
    cookieStore.delete(cookie.name);
  });
  console.log("[Logout Route] All cookies cleared");

  console.log("[Logout Route] Redirecting to login page");
  return NextResponse.redirect(
    `${requestUrl.origin}/login?message=You have been signed out successfully`,
    { status: 302 }
  );
}
