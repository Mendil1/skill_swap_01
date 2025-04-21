import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import MessageList from "../components/message-list";
import MessageInput from "../components/message-input";
import Link from "next/link";
import { ArrowLeft, Info, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ConversationPageProps {
  params: {
    conversationId: string;
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = params;

  console.log("Opening conversation with ID:", conversationId);

  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?message=You must be logged in to view messages");
  }

  try {
    // Fetch connection to verify it exists and the user is part of it
    const { data: connection, error: connectionError } = await supabase
      .from("connection_requests")
      .select(`
        connection_id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:users!connection_requests_sender_id_fkey(user_id, full_name, email, bio),
        receiver:users!connection_requests_receiver_id_fkey(user_id, full_name, email, bio)
      `)
      .eq("connection_id", conversationId)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    // Log connection data or error for debugging
    if (connectionError) {
      console.error("Error fetching connection:", connectionError.message);
      redirect("/messages?error=Error+loading+conversation");
    }

    // Redirect if connection doesn't exist or user is not part of it
    if (!connection || connection.length === 0) {
      console.error("Connection not found:", conversationId);
      redirect("/messages?error=Conversation+not+found");
    }

    const connectionData = connection[0]; // Get the first result since we're not using .single()

    // Redirect if connection is not accepted yet
    if (connectionData.status !== "accepted") {
      console.error("Connection not accepted:", connectionData.status);
      redirect("/messages?error=This+connection+hasn't+been+accepted+yet");
    }

    // Safely access sender and receiver data which might be arrays
    const senderData = Array.isArray(connectionData.sender) 
      ? connectionData.sender[0] 
      : connectionData.sender;
      
    const receiverData = Array.isArray(connectionData.receiver) 
      ? connectionData.receiver[0] 
      : connectionData.receiver;

    // Determine which user is the conversation partner
    const isUserSender = connectionData.sender_id === user.id;
    const partnerId = isUserSender ? connectionData.receiver_id : connectionData.sender_id;
    const partnerInfo = isUserSender ? receiverData : senderData;
    
    // Safely format connection date
    let connectionDate = "Unknown date";
    try {
      if (connectionData.created_at) {
        connectionDate = new Date(connectionData.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error("Date formatting error:", error);
    }

    return (
      <div className="container max-w-6xl py-6 px-4">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/messages"
            className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Messages</span>
          </Link>
          
          <Badge variant="outline" className="text-xs bg-white border-slate-200">
            Connected since {connectionDate}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main chat area - takes 3/4 of the space on desktop */}
          <div className="md:col-span-3">
            <Card className="border shadow-md overflow-hidden bg-white h-[calc(100vh-180px)] flex flex-col">
              {/* Chat header */}
              <div className="border-b p-4 bg-white flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3 border shadow-sm">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${partnerInfo?.full_name || 'User'}`}
                      alt={partnerInfo?.full_name || 'User'}
                    />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                      {partnerInfo?.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium text-slate-800">{partnerInfo?.full_name || 'User'}</h2>
                    <p className="text-xs text-slate-500">{partnerInfo?.email || ''}</p>
                  </div>
                </div>
                <Link href={`/users/${partnerId}`}>
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    <UserCircle2 className="h-4 w-4 mr-1" />
                    <span>View Profile</span>
                  </Button>
                </Link>
              </div>

              {/* Messages container */}
              <div className="flex-1 overflow-y-auto bg-slate-50 p-0">
                <MessageList conversationId={conversationId} userId={user.id} />
              </div>

              {/* Message input */}
              <div className="border-t p-3 bg-white">
                <MessageInput conversationId={conversationId} userId={user.id} />
              </div>
            </Card>
          </div>

          {/* User info sidebar - takes 1/4 of the space on desktop */}
          <div className="hidden md:block">
            <Card className="border shadow-md overflow-hidden bg-white">
              <div className="p-4 border-b bg-indigo-50 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-white shadow">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${partnerInfo?.full_name || 'User'}`}
                    alt={partnerInfo?.full_name || 'User'}
                  />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl">
                    {partnerInfo?.full_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-medium text-slate-800 text-lg">{partnerInfo?.full_name || 'User'}</h2>
                <p className="text-sm text-slate-500">{partnerInfo?.email || ''}</p>
              </div>
              
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-800 mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-1 text-slate-400" />
                  About
                </h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {partnerInfo?.bio || "No bio provided."}
                </p>
                
                <div className="mt-6">
                  <Link href={`/users/${partnerId}`}>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Unexpected error in conversation page:", error);
    redirect("/messages?error=An+unexpected+error+occurred");
  }
}
