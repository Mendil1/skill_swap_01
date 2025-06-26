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
import { AuthProvider } from "@/components/auth-provider";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillSwap - Exchange Skills and Knowledge",
  description: "Connect with others to teach and learn new skills",
  icons: {
    icon: "/favicon.ico",
  },
};

async function getInitialSession(supabase: SupabaseClient<Database>): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("[Layout] Error getting session:", error.message);
      return null;
    }

    if (!data.session) {
      return null;
    }

    // Verify the session on the server
    const { error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.warn("[Layout] Session verification failed:", userError.message);
      // This might happen if the token is expired or invalid. Attempt to sign out.
      await supabase.auth.signOut();
      return null;
    }

    return data.session;
  } catch (e) {
    if (e instanceof Error) {
      console.error("[Layout] Exception getting session:", e.message);
    } else {
      console.error("[Layout] An unknown error occurred while getting session:", e);
    }
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const session = await getInitialSession(supabase);
  const user = session?.user ?? null;

  // Define navigation links to use in both desktop and mobile nav
  const navLinks = [
    { href: "/skills", label: "Explore Skills" },
    { href: "/#how-it-works", label: "How It Works" },
  ];

  // Add authenticated-only links
  const authLinks = user
    ? [
        { href: "/sessions", label: "Sessions" },
        { href: "/messages", label: "Messages" },
        { href: "/credits", label: "Credits" },
      ]
    : [];

  // All links combined
  const allNavLinks = [...navLinks, ...authLinks];

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <CommonResourceHints />
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <PerformanceBudgetMonitor />
        <IntelligentPrefetch />
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
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
                      className="text-slate-700 transition-colors hover:text-indigo-600"
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
                    className="flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-indigo-600"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
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
                  <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
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
        <AuthProvider session={session}>
          <main className="flex-1">{children}</main>
        </AuthProvider>
        <footer className="mt-12 bg-slate-900 py-12 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div className="mb-4 flex items-center gap-2 text-xl font-bold">
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
                <p className="text-sm text-slate-400">
                  Connect with people who want to teach and learn from each other in a collaborative
                  community.
                </p>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <Link href="/" className="transition-colors hover:text-indigo-400">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/skills" className="transition-colors hover:text-indigo-400">
                      Browse Skills
                    </Link>
                  </li>
                  <li>
                    <Link href="/#how-it-works" className="transition-colors hover:text-indigo-400">
                      How It Works
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold">Account</h3>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <Link href="/login" className="transition-colors hover:text-indigo-400">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="transition-colors hover:text-indigo-400">
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="transition-colors hover:text-indigo-400">
                      My Profile
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold">Top Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {["Programming", "Languages", "Music", "Design", "Photography", "Cooking"].map(
                    (cat) => (
                      <span
                        key={cat}
                        className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300"
                      >
                        {cat}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
              <p>© {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
            </div>
          </div>
        </footer>{" "}
        <Toaster position="top-right" richColors closeButton />
        {/* Include auth helper for client-side authentication */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.authHelper = {
                isAuthenticated: function() {
                  return document.cookie.includes('sb-sogwgxkxuuvvvjbqlcdo-auth-token=');
                },
                getUserEmail: function() {
                  const authCookie = document.cookie
                    .split(';')
                    .find(c => c.trim().startsWith('sb-sogwgxkxuuvvvjbqlcdo-auth-token='));
                  if (!authCookie) return null;
                  try {
                    const token = authCookie.split('=')[1];
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return payload.email;
                  } catch (e) {
                    return null;
                  }
                },
                getAuthToken: function() {
                  const authCookie = document.cookie
                    .split(';')
                    .find(c => c.trim().startsWith('sb-sogwgxkxuuvvvjbqlcdo-auth-token='));
                  return authCookie ? authCookie.split('=')[1] : null;
                }
              };
            `,
          }}
        />
        {/* Include network monitor for authenticated users using the client wrapper */}
        <NetworkMonitorWrapper userId={user?.id} />
      </body>
    </html>
  );
}
