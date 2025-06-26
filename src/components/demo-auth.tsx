"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

interface DemoAuthContextType {
  user: User | null;
  loading: boolean;
  demoLogin: (email: string) => void;
  demoLogout: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  user: null,
  loading: false,
  demoLogin: () => {},
  demoLogout: () => {},
});

// Demo user data for presentation
const DEMO_USER: User = {
  id: "demo-user-123",
  email: "demo@skillswap.com",
  user_metadata: {
    full_name: "Demo User",
    bio: "Full-stack developer and UI/UX designer",
    availability: "available",
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for demo session on mount
  useEffect(() => {
    const demoSession = localStorage.getItem("demo-auth-session");
    if (demoSession) {
      try {
        const userData = JSON.parse(demoSession);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem("demo-auth-session");
      }
    }
  }, []);

  const demoLogin = (email: string) => {
    setLoading(true);

    // Simulate login delay for realism
    setTimeout(() => {
      const demoUser = {
        ...DEMO_USER,
        email: email || "demo@skillswap.com",
      };

      setUser(demoUser);
      localStorage.setItem("demo-auth-session", JSON.stringify(demoUser));
      setLoading(false);
    }, 1000);
  };

  const demoLogout = () => {
    setUser(null);
    localStorage.removeItem("demo-auth-session");
  };

  return (
    <DemoAuthContext.Provider value={{ user, loading, demoLogin, demoLogout }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error("useDemoAuth must be used within a DemoAuthProvider");
  }
  return context;
};
