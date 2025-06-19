import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[Logout Route] Processing logout request");

    const supabase = await createClient();

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[Logout Route] Logout failed:", error.message);
      return NextResponse.redirect(
        new URL(`/?message=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    console.log("[Logout Route] Logout successful");

    // Redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("[Logout Route] Unexpected error:", error);
    return NextResponse.redirect(
      new URL("/?message=An unexpected error occurred during logout", request.url)
    );
  }
}
