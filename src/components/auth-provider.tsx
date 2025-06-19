"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log("[AuthProvider] Component mounted, initializing...");
    const supabase = createClient();
    let mounted = true;

    async function getSession() {
      console.log("[AuthProvider] Getting initial session...");
      try {
        // Check if we have any Supabase auth cookies
        const hasAuthCookie =
          document.cookie.includes("sb-") &&
          (document.cookie.includes("auth-token") || document.cookie.includes("auth"));
        console.log("[AuthProvider] Has auth cookie:", hasAuthCookie);
        console.log("[AuthProvider] All cookies:", document.cookie);

        // Always try to get session first, regardless of cookies
        const {
          data: { session: localSession },
        } = await supabase.auth.getSession();

        if (localSession) {
          console.log("[AuthProvider] Found valid session");
          if (mounted) {
            setSession(localSession);
            setUser(localSession.user);
            setLoading(false);
          }
          return;
        }

        // If no session, try direct user verification
        console.log("[AuthProvider] No session found, trying user verification");
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (user && !error) {
          console.log("[AuthProvider] User verified successfully");
          // Try to get session again after user verification
          const {
            data: { session: refreshedSession },
          } = await supabase.auth.getSession();

          if (refreshedSession) {
            if (mounted) {
              setSession(refreshedSession);
              setUser(refreshedSession.user);
              setLoading(false);
            }
          } else {
            // Create a minimal session-like object for the app to work
            const mockSession = {
              user,
              access_token: "mock-token",
              refresh_token: "",
              expires_in: 3600,
              expires_at: Date.now() / 1000 + 3600,
              token_type: "bearer",
            };
            if (mounted) {
              setSession(mockSession as Session);
              setUser(user);
              setLoading(false);
            }
          }
          return;
        }

        // No valid authentication found
        console.log("[AuthProvider] No valid authentication found");
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("[AuthProvider] Error getting session:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    }

    // Always stop loading after 1 second maximum
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log(
          "[AuthProvider] Timeout reached - stopping loading regardless of session state"
        );
        setLoading(false);
      }
    }, 1000);

    getSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "[AuthProvider] Auth state changed:",
        event,
        session ? "Session exists" : "No session"
      );

      if (session) {
        console.log("[AuthProvider] Session details from state change:", {
          user_id: session.user?.id,
          email: session.user?.email,
          expires_at: session.expires_at,
        });
      }

      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        clearTimeout(timeoutId); // Clear timeout since we got a definitive state
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };
  const refreshAuth = async () => {
    console.log("[AuthProvider] Refreshing auth...");
    setLoading(true);

    try {
      const supabase = createClient();
      // Get fresh session and verify with server
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("[AuthProvider] Session error:", sessionError);
        setSession(null);
        setUser(null);
      } else if (session) {
        // Verify session with server
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          console.error("[AuthProvider] User verification error:", userError);
          setSession(null);
          setUser(null);
          await supabase.auth.signOut();
        } else {
          console.log("[AuthProvider] Refresh successful");
          setSession(session);
          setUser(user);
        }
      } else {
        console.log("[AuthProvider] No session found on refresh");
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error("[AuthProvider] Refresh error:", error);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
