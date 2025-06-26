"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDemoAuth } from "./demo-auth";
import { useAuth } from "./auth-provider";
import { useEffect, useState } from "react";

export function HomePageAuthButtons() {
  const { user: demoUser } = useDemoAuth();
  const { user: realUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show loading state or default during hydration
    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/login">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
          >
            Get Started
          </Button>
        </Link>
        <Link href="#how-it-works">
          <Button
            variant="outline"
            size="lg"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto"
          >
            How It Works
          </Button>
        </Link>
      </div>
    );
  }

  const user = demoUser || realUser;

  if (!user) {
    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/login">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
          >
            Get Started
          </Button>
        </Link>
        <Link href="#how-it-works">
          <Button
            variant="outline"
            size="lg"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto"
          >
            How It Works
          </Button>
        </Link>
      </div>
    );
  }

  // User is logged in (demo or real)
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link href="/skills">
        <Button
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
        >
          Explore Skills
        </Button>
      </Link>
      <Link href="/sessions">
        <Button
          variant="outline"
          size="lg"
          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto"
        >
          My Sessions
        </Button>
      </Link>
      {demoUser && (
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 self-center">
          🎯 Demo Mode Active
        </div>
      )}
    </div>
  );
}
