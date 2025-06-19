import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  
  try {
    console.log('[Force Logout] Starting complete auth clear...');
    
    // Get cookie store
    const cookieStore = await cookies();
    
    // Create supabase client
    const supabase = await createClient();
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    console.log('[Force Logout] Supabase signOut completed');
    
    // Get all cookies and delete auth-related ones
    const allCookies = cookieStore.getAll();
    console.log('[Force Logout] Found cookies:', allCookies.map(c => c.name));
    
    allCookies.forEach(cookie => {
      if (cookie.name.includes('sb-') || cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        cookieStore.delete(cookie.name);
        console.log('[Force Logout] Deleted cookie:', cookie.name);
      }
    });
    
    // Create response with additional cookie clearing
    const response = NextResponse.redirect(`${requestUrl.origin}/?cleared=true`, { status: 302 });
    
    // Aggressively clear all potential auth cookies in response
    const cookiesToClear = [
      'sb-sogwgxkxuuvvvjbqlcdo-auth-token',
      'sb-sogwgxkxuuvvvjbqlcdo-auth-token.0',
      'sb-sogwgxkxuuvvvjbqlcdo-auth-token.1',
      'sb-sogwgxkxuuvvvjbqlcdo-refresh-token',
      'sb-sogwgxkxuuvvvjbqlcdo-refresh-token.0', 
      'sb-sogwgxkxuuvvvjbqlcdo-refresh-token.1'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: false
      });
      
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: 'localhost',
        httpOnly: false,
        secure: false
      });
      
      console.log('[Force Logout] Cleared cookie via response:', cookieName);
    });
    
    console.log('[Force Logout] Complete! Redirecting to home...');
    return response;
    
  } catch (error) {
    console.error('[Force Logout] Error:', error);
    return NextResponse.redirect(`${requestUrl.origin}/?error=logout-failed`, { status: 302 });
  }
}
