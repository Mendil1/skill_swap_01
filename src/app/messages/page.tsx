import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, Bell } from "lucide-react";
import ConversationList from "./components/conversation-list";
import ConnectionList from "./components/connection-list";
import { Badge } from "@/components/ui/badge";

export default async function MessagesPage() {
  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?message=You must be logged in to view messages");
  }

  // Count pending connection requests
  const { data: pendingRequests, error: pendingError } = await supabase
    .from('connection_requests')
    .select('connection_id', { count: 'exact' })
    .eq('receiver_id', user.id)
    .eq('status', 'pending');
  
  const pendingCount = pendingError ? 0 : (pendingRequests?.length || 0);

  return (
    <div className="container py-6 px-4 md:py-10 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">Messages</h1>
        <Badge 
          variant="outline" 
          className="text-xs bg-white border-slate-200"
        >
          <Bell className="h-3.5 w-3.5 text-indigo-500 mr-1" />
          <span className="text-slate-600">SkillSwap Messenger</span>
        </Badge>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="mb-6 bg-white border shadow-sm">
          <TabsTrigger value="messages" className="flex gap-2 items-center data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
            <MessageSquare className="h-4 w-4" />
            <span>Conversations</span>
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex gap-2 items-center data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 relative">
            <Users className="h-4 w-4" />
            <span>Connections</span>
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <Card className="border shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b bg-slate-50">
                    <h2 className="font-medium text-slate-800">Recent Conversations</h2>
                    <p className="text-sm text-slate-500">
                      Messages with people you've connected with
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
            <Card className="border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b bg-slate-50">
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
