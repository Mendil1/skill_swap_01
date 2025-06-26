"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import MemoizedNotificationBell from "@/components/memoized-notification-bell";
import OptimizedLink from "@/components/optimized-link";
import { useDemoAuth } from "./demo-auth";
import { useAuth } from "./auth-provider";

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  links: NavLink[];
}

export default function MobileNavUnified({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { user: demoUser, demoLogout } = useDemoAuth();
  const { user: realUser, signOut } = useAuth();

  const user = demoUser || realUser;

  const handleLogout = () => {
    if (demoUser) {
      demoLogout();
      window.location.href = "/";
    } else {
      signOut();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between py-4 border-b">
            <span className="text-lg font-semibold">SkillSwap</span>
            {demoUser && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">DEMO</span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6">
            <ul className="space-y-4">
              {links.map((link) => (
                <li key={link.href}>
                  <OptimizedLink
                    href={link.href}
                    className="block py-2 text-slate-700 hover:text-indigo-600 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </OptimizedLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t pt-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {realUser && <MemoizedNotificationBell />}
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {demoUser ? "Demo User" : user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <OptimizedLink
                    href="/profile"
                    className="block w-full text-left py-2 px-3 text-sm text-slate-700 hover:bg-slate-50 rounded"
                    onClick={() => setOpen(false)}
                  >
                    {demoUser ? "Demo Profile" : "My Profile"}
                  </OptimizedLink>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                  >
                    {demoUser ? "End Demo" : "Sign Out"}
                  </Button>
                </div>
              </div>
            ) : (
              <OptimizedLink href="/login" onClick={() => setOpen(false)}>
                <Button className="w-full">Sign In</Button>
              </OptimizedLink>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
