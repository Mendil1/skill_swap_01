import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FallbackImage } from "@/components/ui/fallback-image";
import MobileNav from "@/components/mobile-nav";
import MemoizedNotificationBell from "@/components/memoized-notification-bell";
import NetworkMonitorWrapper from "@/components/network-monitor-wrapper";
import { CommonResourceHints, PerformanceBudgetMonitor } from "@/components/resource-hints";
import { IntelligentPrefetch } from "@/components/intelligent-prefetch";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillSwap - Exchange Skills and Knowledge",
  description: "Connect with others to teach and learn new skills",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;

  // Define navigation links to use in both desktop and mobile nav
  const navLinks = [
    { href: "/skills", label: "Explore Skills" },
    { href: "/#how-it-works", label: "How It Works" },
  ];

  // Add authenticated-only links
  const authLinks = user ? [
    { href: "/sessions", label: "Sessions" },
    { href: "/messages", label: "Messages" },
    { href: "/credits", label: "Credits" }
  ] : [];

  // All links combined
  const allNavLinks = [...navLinks, ...authLinks];

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <CommonResourceHints />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <PerformanceBudgetMonitor />
        <IntelligentPrefetch />
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

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex items-center gap-6">
                {allNavLinks.map((link) => (
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
              {user ? (
                <>
                  {/* Notification Bell */}
                  <MemoizedNotificationBell />

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-sm text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline">My Profile</span>
                  </Link>
                  <Link href="/auth/logout" className="hidden md:block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      Sign Out
                    </Button>
                  </Link>
                </>
              ) : (
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

              {/* Mobile Navigation Trigger */}
              <div className="md:hidden">
                <MobileNav links={allNavLinks} user={user} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-slate-900 text-white py-12 mt-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="font-bold text-xl flex items-center gap-2 mb-4">
                <FallbackImage
                  src="/skill_swap_logo_white_background.png"
                  alt="SkillSwap Logo"
                  width={40}
                  height={40}
                  fallbackSrc="/globe.svg"
                  className="h-10 w-auto rounded-full"
                />
                SkillSwap
              </div>

              <div>
                <p className="text-slate-400 text-sm">
                  Connect with people who want to teach and learn from each
                  other in a collaborative community.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/skills"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      Browse Skills
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#how-it-works"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      How It Works
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-lg">Account</h3>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/profile"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      My Profile
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-lg">Top Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Programming",
                    "Languages",
                    "Music",
                    "Design",
                    "Photography",
                    "Cooking",
                  ].map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-8 pt-8 text-slate-400 text-sm text-center">
              <p>
                © {new Date().getFullYear()} SkillSwap. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        <Toaster position="top-right" richColors closeButton />

        {/* Include network monitor for authenticated users using the client wrapper */}
        <NetworkMonitorWrapper userId={user?.id} />
      </body>
    </html>
  );
}
