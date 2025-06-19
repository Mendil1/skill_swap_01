import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Server-side authentication wrapper that ensures user is authenticated
 * before accessing protected resources. This runs on the server and provides
 * proper session management with fallback handling for production issues.
 */
export async function withServerAuth<T>(
  callback: (user: User, supabase: SupabaseClient) => Promise<T>
): Promise<T> {
  try {
    // Use the standard client
    const supabase = await createClient();

    console.log("[ServerAuth] Attempting authentication...");

    // Check for auth cookies first
    const cookieStore = await cookies();
    const authCookies = cookieStore.getAll().filter((c) => c.name.startsWith("sb-"));
    console.log("[ServerAuth] Found auth cookies:", authCookies.length);

    if (authCookies.length === 0) {
      console.log("[ServerAuth] No auth cookies found, redirecting to login");
      redirect("/login");
    }

    // Try to get user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.log("[ServerAuth] Auth error:", error.message);

      // If read-only client fails, try regular client
      console.log("[ServerAuth] Trying regular client as fallback...");
      const fallbackSupabase = await createClient();
      const {
        data: { user: fallbackUser },
        error: fallbackError,
      } = await fallbackSupabase.auth.getUser();

      if (fallbackError || !fallbackUser) {
        console.log("[ServerAuth] Fallback auth also failed, redirecting to login");
        redirect("/login");
      }

      console.log("[ServerAuth] Fallback authentication successful:", fallbackUser.email);
      return await callback(fallbackUser, fallbackSupabase);
    }

    if (!user) {
      console.log("[ServerAuth] No user found despite cookies, redirecting to login");
      redirect("/login");
    }

    console.log("[ServerAuth] Authentication successful:", user.email);
    return await callback(user, supabase);
  } catch (error: unknown) {
    // Check if it's a redirect error (which is normal)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as any).digest === "string" &&
      (error as any).digest.includes("NEXT_REDIRECT")
    ) {
      console.log("[ServerAuth] Redirect triggered - this is expected");
      throw error; // Re-throw redirect
    }

    console.error("[ServerAuth] Unexpected authentication error:", error);
    redirect("/login");
  }
}

/**
 * Server action wrapper that ensures user is authenticated before executing
 * server actions. Provides consistent authentication handling across actions.
 */
export async function withServerActionAuth<T>(
  callback: (user: User, supabase: SupabaseClient) => Promise<T>
): Promise<T> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.log("[ServerActionAuth] No authenticated user found");
      throw new Error("Authentication required");
    }

    console.log("[ServerActionAuth] Authenticated user:", user.email);
    return await callback(user, supabase);
  } catch (error) {
    console.error("[ServerActionAuth] Authentication error:", error);
    throw error;
  }
}
