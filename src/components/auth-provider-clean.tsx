"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

// Global state to persist across hot reloads
const globalAuth = {
  user: null as User | null,
  session: null as Session | null,
  loading: true,
  initialized: false,
  initPromise: null as Promise<void> | null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(globalAuth.user);
  const [session, setSession] = useState<Session | null>(globalAuth.session);
  const [loading, setLoading] = useState<boolean>(globalAuth.loading);
  const instanceId = useRef(Math.random().toString(36).substr(2, 6));
  
  console.log(`[AuthProvider:${instanceId.current}] Starting - initialized: ${globalAuth.initialized}`);
  
  const supabase = createClient();

  // Update global state when local state changes
  const updateGlobalState = (newUser: User | null, newSession: Session | null, newLoading: boolean) => {
    globalAuth.user = newUser;
    globalAuth.session = newSession;
    globalAuth.loading = newLoading;
    setUser(newUser);
    setSession(newSession);
    setLoading(newLoading);
  };

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      console.log(`[AuthProvider:${instanceId.current}] Initializing auth...`);

      // First try to get existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log(`[AuthProvider:${instanceId.current}] getSession:`, { 
        hasSession: !!session, 
        email: session?.user?.email,
        error: error?.message 
      });

      if (session?.user) {
        console.log(`[AuthProvider:${instanceId.current}] Found existing session`);
        updateGlobalState(session.user, session, false);
        return;
      }

      // No session, try to sync from server
      console.log(`[AuthProvider:${instanceId.current}] No session, trying server sync...`);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError?.message === "Auth session missing!") {
        // Try session sync from server cookies
        try {
          const response = await fetch('/auth/sync-session', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (response.ok) {
            const sessionData = await response.json();
            console.log(`[AuthProvider:${instanceId.current}] Got server session, setting up client`);
            
            const { error: setError } = await supabase.auth.setSession({
              access_token: sessionData.access_token,
              refresh_token: sessionData.refresh_token,
            });
            
            if (!setError) {
              const { data: { session: newSession } } = await supabase.auth.getSession();
              if (newSession) {
                console.log(`[AuthProvider:${instanceId.current}] Session sync successful`);
                updateGlobalState(newSession.user, newSession, false);
                return;
              }
            }
          }
        } catch (syncError) {
          console.warn(`[AuthProvider:${instanceId.current}] Session sync failed:`, syncError);
        }
      }

      // No authentication found
      console.log(`[AuthProvider:${instanceId.current}] No authentication found`);
      updateGlobalState(null, null, false);
      
    } catch (error) {
      console.error(`[AuthProvider:${instanceId.current}] Init error:`, error);
      updateGlobalState(null, null, false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // If already initialized by another instance, use global state
    if (globalAuth.initialized) {
      console.log(`[AuthProvider:${instanceId.current}] Using existing global state`);
      setUser(globalAuth.user);
      setSession(globalAuth.session);
      setLoading(globalAuth.loading);
      return;
    }

    // If initialization is in progress, wait for it
    if (globalAuth.initPromise) {
      console.log(`[AuthProvider:${instanceId.current}] Waiting for existing init...`);
      globalAuth.initPromise.then(() => {
        if (mounted) {
          setUser(globalAuth.user);
          setSession(globalAuth.session);
          setLoading(globalAuth.loading);
        }
      });
      return;
    }

    // Start initialization
    globalAuth.initPromise = initializeAuth().finally(() => {
      globalAuth.initialized = true;
      globalAuth.initPromise = null;
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AuthProvider:${instanceId.current}] Auth changed:`, event, session?.user?.email);
        
        if (session?.user) {
          updateGlobalState(session.user, session, false);
        } else {
          updateGlobalState(null, null, false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log(`[AuthProvider:${instanceId.current}] Signing out...`);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
      } else {
        updateGlobalState(null, null, false);
        // Reset global state
        globalAuth.initialized = false;
        globalAuth.initPromise = null;
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
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
