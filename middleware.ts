import { NextResponse, NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // First update the session with our improved middleware helper
  const response = await updateSession(request);

  // Get the current pathname
  const { pathname } = request.nextUrl;

  // Protected routes configuration
  const protectedRoutes = ["/dashboard", "/profile", "/skills"];
  const authRoutes = ["/login", "/signup"];

  // Check for Supabase session cookie (the actual cookie name is typically sb-<project-ref>-auth-token)
  // We'll check for any cookie starting with 'sb-' that includes '-auth-token'
  const hasAuthCookie = Array.from(request.cookies.getAll()).some(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
  );

  // Redirect unauthenticated users from protected routes to login
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !hasAuthCookie
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users from auth routes to home
  if (authRoutes.includes(pathname) && hasAuthCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  // Continue with the updated session
  return response;
}

export const config = {
  // Only run middleware on routes that need auth checking
  // More specific matching for better performance
  matcher: [
    // Protected routes that need auth
    '/dashboard/:path*',
    '/profile/:path*',
    '/skills/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    // Auth routes
    '/login',
    '/signup',
    // Home page and top level routes
    '/',
    '/users/:path*',
  ],
};
