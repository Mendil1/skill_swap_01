import { NextResponse } from "next/server";

export async function GET() {
  console.log("[Test Cookies] Setting test cookie");

  const response = NextResponse.json({
    message: "Test cookie set!",
    cookieSettings: {
      domain: undefined, // Let browser determine
      path: "/",
      secure: false,
      sameSite: "lax",
      httpOnly: false,
    },
  });

  // Set multiple test cookies with different configurations
  response.cookies.set("test-cookie", "test-value", {
    path: "/",
    secure: false,
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24, // 1 day
  });

  // Try a session cookie (no maxAge)
  response.cookies.set("session-test", "session-value", {
    path: "/",
    secure: false,
    sameSite: "lax",
    httpOnly: false,
  });

  // Try with different sameSite
  response.cookies.set("none-test", "none-value", {
    path: "/",
    secure: false,
    sameSite: "none",
    httpOnly: false,
  });

  console.log("[Test Cookies] Multiple cookies should be set now");

  return response;
}
