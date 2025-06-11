import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, Bell } from "lucide-react";
import ConversationList from "./components/improved-conversation-list";
import ConnectionList from "./components/connection-list";
import { Badge } from "@/components/ui/badge";

export default async function MessagesPage() {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?message=You must be logged in to view messages");
  }

  // Count pending connection requests
  const { data: pendingRequests, error: pendingError } = await supabase
    .from("connection_requests")
    .select("connection_id", { count: "exact" })
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  const pendingCount = pendingError ? 0 : pendingRequests?.length || 0;

  return (
    <div className="container px-4 py-6 md:px-6 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
          Messages
        </h1>
        <Badge variant="outline" className="border-slate-200 bg-white text-xs">
          <Bell className="mr-1 h-3.5 w-3.5 text-indigo-500" />
          <span className="text-slate-600">SkillSwap Messenger</span>
        </Badge>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="mb-6 border bg-white shadow-sm">
          <TabsTrigger
            value="messages"
            className="flex items-center gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Conversations</span>
          </TabsTrigger>
          <TabsTrigger
            value="connections"
            className="relative flex items-center gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600"
          >
            <Users className="h-4 w-4" />
            <span>Connections</span>
            {pendingCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-3">
              <Card className="overflow-hidden border bg-white shadow-sm">
                <CardContent className="p-0">
                  <div className="border-b bg-slate-50 p-4">
                    <h2 className="font-medium text-slate-800">Recent Conversations</h2>{" "}
                    <p className="text-sm text-slate-500">
                      Messages with people you&apos;ve connected with
                    </p>
                  </div>
                  <ConversationList userId={user.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="connections">
          <div className="grid grid-cols-1 gap-6">
            <Card className="overflow-hidden border bg-white shadow-sm">
              <CardContent className="p-0">
                <div className="border-b bg-slate-50 p-4">
                  <h2 className="font-medium text-slate-800">My Network</h2>
                  <p className="text-sm text-slate-500">
                    Manage your connections to exchange skills with others
                  </p>
                </div>
                <ConnectionList userId={user.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
