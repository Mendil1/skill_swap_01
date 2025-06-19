"use client";

import { useEffect } from "react";
import { AuthDebugger } from "@/utils/auth-debugger";

export function ClientAuthDebugger() {
  useEffect(() => {
    // Run initial diagnostic
    AuthDebugger.fullDiagnostic("Page Load");

    // Log navigation changes
    const handleNavigation = () => {
      setTimeout(() => {
        AuthDebugger.fullDiagnostic("Navigation");
      }, 100);
    };

    // Listen for browser navigation
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  return null;
}
