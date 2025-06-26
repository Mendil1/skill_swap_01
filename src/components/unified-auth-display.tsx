"use client";

import { useDemoAuth } from "./demo-auth";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import Link from "next/link";
import MemoizedNotificationBell from "./memoized-notification-bell";

export function UnifiedAuthDisplay() {
  const { user: demoUser, demoLogout } = useDemoAuth();
  const { user: realUser, signOut } = useAuth();

  // Use demo user if available, otherwise fall back to real user
  const displayUser = demoUser || realUser;

  const handleLogout = () => {
    if (demoUser) {
      demoLogout();
      window.location.href = "/";
    } else {
      signOut();
    }
  };

  if (!displayUser) {
    return (
      <Link href="/login" className="hidden md:block">
        <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <>
      {/* Notification Bell - only for real users */}
      {realUser && <MemoizedNotificationBell />}

      <Link
        href="/profile"
        className="flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-indigo-600"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          {displayUser.email?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:inline">
          {demoUser ? "Demo Profile" : "My Profile"}
        </span>
        {demoUser && (
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded ml-1">DEMO</span>
        )}
      </Link>

      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hidden md:block"
      >
        {demoUser ? "End Demo" : "Sign Out"}
      </Button>
    </>
  );
}
