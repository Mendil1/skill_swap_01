import { NextResponse, NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // First update the session with our improved middleware helper
  const response = await updateSession(request);

  // Get the current pathname
  const { pathname } = request.nextUrl;

  // Only protect truly sensitive routes - be less aggressive
  const protectedRoutes = ["/dashboard"];
  const authRoutes = ["/login", "/signup"];

  // Skip auth checking for public routes, API routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // Check for Supabase session cookie (the actual cookie name is typically sb-<project-ref>-auth-token)
  // We'll check for any cookie starting with 'sb-' that includes '-auth-token'
  const hasAuthCookie = Array.from(request.cookies.getAll()).some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
  );

  console.log(`[Middleware] Path: ${pathname}, HasAuthCookie: ${hasAuthCookie}`);

  // Only redirect for truly protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !hasAuthCookie) {
    console.log(`[Middleware] Redirecting to login from protected route: ${pathname}`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users from auth routes to home
  if (authRoutes.includes(pathname) && hasAuthCookie) {
    console.log(`[Middleware] Redirecting authenticated user to home from: ${pathname}`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Continue with the updated session
  return response;
}

export const config = {
  // Be more specific about which routes need middleware - avoid over-processing
  matcher: [
    // Only truly protected routes
    "/dashboard/:path*",
    // Auth routes
    "/login",
    "/signup",
    // Exclude API routes, static files, and other non-page routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
