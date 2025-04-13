import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore.getAll()).map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
            ...cookie.attributes,
          }));
        },
        async setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, ...options }) => {
            cookieStore.set({
              name,
              value,
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              path: "/",
            });
          });
        },
      },
    }
  );
}

export default createClient;
