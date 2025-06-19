import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  console.log("[Cookie Test] Testing cookie setting");

  const response = NextResponse.json({ message: "Cookie test" });

  // Test setting a simple cookie
  response.cookies.set("test-cookie", "test-value", {
    path: "/",
    secure: false,
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60, // 1 hour
  });

  console.log("[Cookie Test] Cookie should be set");

  return response;
}
