"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, Bell } from "lucide-react";
import ConversationList from "./components/improved-conversation-list";
import ConnectionList from "./components/connection-list";
import { Badge } from "@/components/ui/badge";

export default function ClientMessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMessages() {
      const supabase = createClient();

      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log('[Messages] No authenticated user, redirecting to login');
          router.push('/login?message=You%20must%20be%20logged%20in%20to%20view%20messages');
          return;
        }

        setUser(user);

        // Count pending connection requests
        const { data: pendingRequests, error: pendingError } = await supabase
          .from("connection_requests")
          .select("connection_id", { count: "exact" })
          .eq("receiver_id", user.id)
          .eq("status", "pending");

        setPendingCount(pendingError ? 0 : pendingRequests?.length || 0);

      } catch (err) {
        console.error('[Messages] Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [router]);

  if (loading) {
    return (
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600">Please log in to view messages</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 md:px-6 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
          Messages & Connections
        </h1>
      </div>

      <Tabs defaultValue="conversations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Connections
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ConversationList userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ConnectionList userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
