import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = new URL(request.url);

  // Protected routes configuration
  const protectedRoutes = ["/dashboard", "/profile", "/skills"];
  const authRoutes = ["/login", "/signup"];

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authRoutes.includes(pathname) && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
