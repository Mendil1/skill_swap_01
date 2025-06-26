"use client";

import { Button } from "@/components/ui/button";

export function DemoLoginButton() {
  const handleDemoLogin = () => {
    // Create a demo user and session
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@skillswap.com',
      user_metadata: {
        full_name: 'Demo User',
        bio: 'Demo user for presentation'
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    const demoSession = {
      user: demoUser,
      access_token: "demo-persistent-token-" + Date.now(),
      refresh_token: "",
      expires_in: 999999,
      expires_at: Date.now() / 1000 + 999999,
      token_type: "bearer",
    };

    // Store in localStorage for persistence
    localStorage.setItem('demo-session-persist', JSON.stringify({
      session: demoSession,
      user: demoUser,
      timestamp: Date.now()
    }));

    // Redirect to home
    window.location.href = "/";
  };

  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 DEMO MODE</h3>
      <p className="text-sm text-green-600 mb-3">
        For jury presentation - instant persistent login
      </p>

      <Button
        onClick={handleDemoLogin}
        className="w-full bg-green-600 text-white hover:bg-green-700 font-medium"
      >
        🚀 DEMO LOGIN (Never Logs Out!)
      </Button>

      <p className="text-xs text-green-500 mt-2">
        ✅ Survives page refresh | ✅ Perfect for presentation | ✅ No database required
      </p>
    </div>
  );
}
