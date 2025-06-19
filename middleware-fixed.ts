import { NextResponse, NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Get the current pathname
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (pathname.startsWith("/_next/") || pathname.startsWith("/api/") || pathname.includes(".")) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Processing request for: ${pathname}`);

  // Always run session update to maintain authentication state
  const response = await updateSession(request);

  // Check for Supabase session cookie
  const hasAuthCookie = Array.from(request.cookies.getAll()).some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.value.length > 0
  );

  console.log(`[Middleware] Auth cookie present: ${hasAuthCookie}`);

  // Routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/messages",
    "/credits",
    "/sessions",
    "/notifications",
  ];

  const authRoutes = ["/login", "/signup"];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // For protected routes, check if user is authenticated
  if (isProtectedRoute && !hasAuthCookie) {
    console.log(`[Middleware] Redirecting unauthenticated user from ${pathname} to login`);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages (but only if we have a valid session)
  if (isAuthRoute && hasAuthCookie) {
    console.log(
      `[Middleware] Redirecting authenticated user from ${pathname} to intended destination`
    );
    const returnUrl = request.nextUrl.searchParams.get("returnUrl");
    const redirectTo = returnUrl && returnUrl !== pathname ? returnUrl : "/";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Core protected routes
    "/dashboard/:path*",
    // Auth routes
    "/login",
    "/signup",
    // Home page
    "/",
    // Protected feature routes
    "/profile/:path*",
    "/skills/:path*",
    "/notifications/:path*",
    "/sessions/:path*",
    "/messages/:path*",
    "/credits/:path*",
  ],
};
