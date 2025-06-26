"use client";

import { useDemoAuth } from "./demo-auth";
import { useAuth } from "./auth-provider";

export function DemoUserDisplay() {
  const { user: demoUser } = useDemoAuth();
  const { user: realUser } = useAuth();

  // Use demo user if available, otherwise fall back to real user
  const displayUser = demoUser || realUser;

  if (!displayUser) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        {displayUser.email?.charAt(0).toUpperCase()}
      </div>
      <span className="hidden md:inline text-sm">
        {demoUser ? "Demo User" : displayUser.email}
      </span>
      {demoUser && (
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">DEMO</span>
      )}
    </div>
  );
}
