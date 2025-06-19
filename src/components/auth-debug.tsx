"use client";

import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";

export default function AuthDebug() {
  const { user, loading, session } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Loading: {loading ? "true" : "false"}</div>
      <div>User: {user ? user.email : "null"}</div>
      <div>Session: {session ? "exists" : "null"}</div>
      <div>Timestamp: {new Date().toLocaleTimeString()}</div>
    </div>
  );
}
