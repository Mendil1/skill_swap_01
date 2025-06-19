import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return NextResponse.redirect(
        new URL("/signup?message=Email and password are required", request.url)
      );
    }

    console.log("[Signup Route] Attempting signup for:", email);

    const supabase = await createClient();

    // Attempt to sign up
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("[Signup Route] Signup failed:", error.message);
      return NextResponse.redirect(
        new URL(`/signup?message=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    console.log("[Signup Route] Signup successful for user:", authData?.user?.email);

    // Redirect to confirmation page or login
    return NextResponse.redirect(
      new URL("/login?message=Check your email to confirm your account", request.url)
    );
  } catch (error) {
    console.error("[Signup Route] Unexpected error:", error);
    return NextResponse.redirect(
      new URL("/signup?message=An unexpected error occurred", request.url)
    );
  }
}
