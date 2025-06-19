"use client";

import { useAuth } from "@/components/auth-provider";
import { FallbackImage } from "@/components/ui/fallback-image";
import Link from "next/link";

export default function NavigationFooter() {
  const { user } = useAuth();

  return (
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
              {user ? (
                // Authenticated user links
                <>
                  <li>
                    <Link
                      href="/profile"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/messages"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      Messages
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/credits"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      Credits
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/logout"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      Sign Out
                    </Link>
                  </li>
                </>
              ) : (
                // Unauthenticated user links
                <>
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
                </>
              )}
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
  );
}
