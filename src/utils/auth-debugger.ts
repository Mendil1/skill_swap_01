import { createClient } from "@/utils/supabase/client";

// Comprehensive authentication debugging utility
export class AuthDebugger {
  static logCookies(label: string) {
    console.log(`🍪 [${label}] Cookies:`, document.cookie);
    console.log(
      `🔐 [${label}] Auth cookies:`,
      document.cookie
        .split(";")
        .filter((c) => c.includes("sb-"))
        .map((c) => c.trim())
    );
  }

  static async logSession(label: string) {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    console.log(`📋 [${label}] Session:`, {
      exists: !!session,
      email: session?.user?.email,
      expires: session?.expires_at,
      error: error?.message,
    });
  }

  static async logUser(label: string) {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    console.log(`👤 [${label}] User:`, {
      exists: !!user,
      email: user?.email,
      error: error?.message,
    });
  }

  static async fullDiagnostic(label: string) {
    console.log(`\n=== ${label.toUpperCase()} DIAGNOSTIC ===`);
    this.logCookies(label);
    await this.logSession(label);
    await this.logUser(label);
    console.log(`=== END ${label.toUpperCase()} DIAGNOSTIC ===\n`);
  }
}

// Make it available globally for browser console use
if (typeof window !== "undefined") {
  (window as typeof window & { AuthDebugger: typeof AuthDebugger }).AuthDebugger = AuthDebugger;
}
