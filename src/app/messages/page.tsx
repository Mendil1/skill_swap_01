"use client";

import { useAuth } from "@/components/auth-provider";
import EnhancedMessagesPage from "./page-enhanced";

export default function MessagesPage() {
  const { user, loading } = useAuth();

  // Show loading state briefly
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  // If no user, show login prompt instead of redirecting
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Please Log In</h1>
          <p className="mb-4 text-gray-600">You need to be logged in to view messages.</p>
          <a
            href="/login"
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <EnhancedMessagesPage />;
}
