"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  links: NavLink[];
  user: any;
}

export default function MobileNav({ links, user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80%] sm:w-[350px] pt-12">
        <X 
          className="absolute top-4 right-4 h-5 w-5 text-slate-500 cursor-pointer hover:text-slate-700" 
          onClick={() => setOpen(false)}
        />
        
        <nav className="flex flex-col space-y-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-slate-700 hover:text-indigo-600 py-2 border-b border-slate-100"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {/* User specific links at the bottom */}
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-lg font-medium text-slate-700 hover:text-indigo-600 py-2"
                onClick={() => setOpen(false)}
              >
                My Profile
              </Link>
              <Link href="/auth/logout" onClick={() => setOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  Sign Out
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button
                variant="default"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}