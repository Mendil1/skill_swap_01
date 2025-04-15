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

  // Get auth status from the cookie (we don't need to create another Supabase client)
  const supabaseCookie = request.cookies.get("sb-auth-token");
  const isAuthenticated = !!supabaseCookie;

  // Redirect unauthenticated users from protected routes to login
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users from auth routes to home
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Continue with the updated session
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
