"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDemoAuth } from "./demo-auth";
import { useAuth } from "./auth-provider";

export function CTAButton() {
  const { user: demoUser } = useDemoAuth();
  const { user: realUser } = useAuth();

  const user = demoUser || realUser;

  if (!user) {
    return (
      <Link href="/login">
        <Button
          size="lg"
          variant="outline"
          className="bg-transparent border-white hover:bg-white hover:text-indigo-600 transition-colors"
        >
          Sign Up Now
        </Button>
      </Link>
    );
  }

  return (
    <Link href="/profile">
      <Button
        size="lg"
        variant="outline"
        className="bg-transparent border-white hover:bg-white hover:text-indigo-600 transition-colors"
      >
        Update Your Profile
      </Button>
    </Link>
  );
}
