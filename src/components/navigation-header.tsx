"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FallbackImage } from "@/components/ui/fallback-image";
import MobileNav from "@/components/mobile-nav";
import MemoizedNotificationBell from "@/components/memoized-notification-bell";

export default function NavigationHeader() {
  const { user, loading } = useAuth();

  // Base navigation links available to all users
  const baseNavLinks = [
    { href: "/skills", label: "Explore Skills" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/sessions", label: "Sessions" },
  ];

  // User-specific navigation links
  const userNavLinks = [
    { href: "/messages", label: "Messages" },
    { href: "/credits", label: "Credits" },
  ];  // Combine links based on authentication status
  const navLinks = user ? [...baseNavLinks, ...userNavLinks] : baseNavLinks;

  return (
    <header className="border-b border-slate-200 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="font-bold text-xl flex items-center gap-2 text-indigo-600"
        >
          <FallbackImage
            src="/skill_swap_logo_no_background.png"
            alt="SkillSwap Logo"
            width={40}
            height={40}
            fallbackSrc="/globe.svg"
            className="h-10 w-auto"
          />
          SkillSwap
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* Show notification bell for authenticated users on desktop */}
          {user && !loading && (
            <div className="hidden md:block">
              <MemoizedNotificationBell />
            </div>
          )}          {/* Authentication-based buttons */}
          {!loading && (
            <>
              {user ? (
                // Authenticated user buttons
                <>
                  <Link href="/profile" className="hidden md:block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      Profile
                    </Button>
                  </Link>
                  <Link href="/auth/logout" className="hidden md:block">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:text-slate-800"
                    >
                      Sign Out
                    </Button>
                  </Link>
                </>
              ) : (
                // Unauthenticated user button
                <Link href="/login" className="hidden md:block">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </>
          )}

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <MobileNav links={navLinks} user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
