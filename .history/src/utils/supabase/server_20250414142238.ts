import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              path: "/",
            });
          } catch (error) {
            // Handle the error gracefully without throwing
            console.warn("Cookie could not be set:", error);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ 
              name, 
              value: "", 
              ...options,
              expires: new Date(0),
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              path: "/",
            });
          } catch (error) {
            // Handle the error gracefully without throwing
            console.warn("Cookie could not be removed:", error);
          }
        },
      },
    }
  );
}

export default createClient;
