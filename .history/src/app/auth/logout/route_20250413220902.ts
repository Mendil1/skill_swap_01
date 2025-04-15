import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = cookies();
  
  // Create a new supabase server client
  const supabase = await createClient();
  
  // Sign out by removing the session cookie
  await supabase.auth.signOut();
  
  // Clear all cookies to ensure the session is fully terminated
  const allCookies = cookieStore.getAll();
  allCookies.forEach(cookie => {
    cookieStore.delete(cookie.name);
  });
  
  // Redirect to login page with a message
  return NextResponse.redirect(
    `${requestUrl.origin}/login?message=You have been signed out successfully`,
    { status: 302 }
  );
}