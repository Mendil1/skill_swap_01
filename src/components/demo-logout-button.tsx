"use client";

import { useDemoAuth } from "./demo-auth";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";

export function DemoLogoutButton() {
  const { user: demoUser, demoLogout } = useDemoAuth();
  const { signOut } = useAuth();

  const handleLogout = () => {
    if (demoUser) {
      demoLogout();
      window.location.href = "/";
    } else {
      signOut();
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
    >
      {demoUser ? "End Demo" : "Sign Out"}
    </Button>
  );
}
