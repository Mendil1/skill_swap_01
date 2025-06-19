import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("[Login API] Attempting login for:", email);

    const supabase = await createClient();

    // Attempt to sign in
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Login API] Login failed:", error.message);
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }

    console.log("[Login API] Login successful for user:", authData?.user?.email);

    // Verify user authentication
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("[Login API] User verification failed:", userError);
      return NextResponse.json(
        { success: false, message: "Authentication verification failed" },
        { status: 401 }
      );
    }

    console.log("[Login API] User verified:", userData?.user?.email);

    // Create response with explicit cookie handling
    const response = NextResponse.json({
      success: true,
      user: userData.user,
      message: "Login successful",
    });

    // The Supabase client should have already set the cookies via the server client
    // But let's ensure they're set with the correct attributes for localhost
    console.log("[Login API] Authentication successful, cookies should be set by Supabase");

    return response;
  } catch (error) {
    console.error("[Login API] Unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
