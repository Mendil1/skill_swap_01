"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Search, Clock, AlertCircle, MessageSquare, RefreshCw } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  connection_id: string;
  partner_id: string;
  partner_name: string;
  partner_email?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ImprovedConversationListProps {
  userId: string;
}

export default function ImprovedConversationList({ userId }: ImprovedConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      console.log("❌ No userId provided");
      return;
    }

    try {
      console.log("🔍 Fetching conversations for user:", userId);

      // First, get all accepted connections where the user is either sender or receiver
      const { data: connections, error: connectionsError } = await supabase
        .from("connection_requests")
        .select(
          `
          connection_id,
          sender_id,
          receiver_id,
          status,
          created_at,
          sender:users!connection_requests_sender_id_fkey(user_id, full_name, email),
          receiver:users!connection_requests_receiver_id_fkey(user_id, full_name, email)
        `
        )
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq("status", "accepted")
        .order("created_at", { ascending: false });

      if (connectionsError) {
        console.error("❌ Error fetching connections:", connectionsError);
        throw connectionsError;
      }

      console.log(`✅ Found ${connections?.length || 0} connections`);

      if (!connections || connections.length === 0) {
        setConversations([]);
        return;
      }

      // For each connection, get the latest message and build conversation data
      const conversationsWithMessages = await Promise.all(
        connections.map(async (connection) => {
          try {
            // Determine which user is the conversation partner
            const isUserSender = connection.sender_id === userId;
            const partnerId = isUserSender ? connection.receiver_id : connection.sender_id;

            // Safely access user data (handle both array and object formats)
            const senderData = Array.isArray(connection.sender)
              ? connection.sender[0]
              : connection.sender;
            const receiverData = Array.isArray(connection.receiver)
              ? connection.receiver[0]
              : connection.receiver;

            const partnerData = isUserSender ? receiverData : senderData;
            const partnerName = partnerData?.full_name || partnerData?.email || "Unknown User";
            const partnerEmail = partnerData?.email || "";

            console.log(`👤 Partner for connection ${connection.connection_id}: ${partnerName}`); // Get the latest message for this connection
            const { data: messages, error: messagesError } = await supabase
              .from("messages")
              .select("message_id, sender_id, content, sent_at")
              .eq("connection_id", connection.connection_id)
              .order("sent_at", { ascending: false })
              .limit(1);

            if (messagesError) {
              console.error(
                `❌ Error fetching messages for connection ${connection.connection_id}:`,
                messagesError
              );
            } // Get unread message count (simplified - count messages from partner)
            const { count: unreadCount } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("connection_id", connection.connection_id)
              .eq("sender_id", partnerId);
            const latestMessage = messages && messages.length > 0 ? messages[0] : null;
            const lastMessageTime = latestMessage?.sent_at || connection.created_at;

            console.log(
              `📨 Connection ${connection.connection_id}: ${messages?.length || 0} messages, latest: "${latestMessage?.content || "No messages"}"`
            );

            return {
              connection_id: connection.connection_id,
              partner_id: partnerId,
              partner_name: partnerName,
              partner_email: partnerEmail,
              last_message: latestMessage?.content || "No messages yet",
              last_message_time: lastMessageTime,
              unread_count: unreadCount || 0,
            };
          } catch (err) {
            console.error(`❌ Error processing connection ${connection.connection_id}:`, err);
            return null;
          }
        })
      ); // Filter out null results and sort by last message time
      const validConversations = conversationsWithMessages
        .filter((conv): conv is NonNullable<typeof conv> => conv !== null)
        .sort((a, b) => {
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });

      console.log(`✅ Processed ${validConversations.length} valid conversations`);
      setConversations(validConversations);
    } catch (err) {
      console.error("❌ Error in fetchConversations:", err);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, supabase]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Set up real-time subscription for message updates
  useEffect(() => {
    if (!userId) return;

    console.log("🔄 Setting up real-time subscription for conversations");

    const channel = supabase
      .channel("conversations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        console.log("📨 Real-time message update:", payload);
        // Refresh conversations when messages change
        fetchConversations();
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "connection_requests" },
        (payload) => {
          console.log("🤝 Real-time connection update:", payload);
          // Refresh when connections change
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      console.log("🔄 Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, fetchConversations, supabase]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((convo) =>
    convo.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-3 p-3">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 animate-pulse" />
            <span>Loading conversations...</span>
          </div>
        </div>
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center rounded-lg border border-slate-100 p-3"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="ml-3 flex-1 space-y-2">
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-3 w-[200px]" />
              </div>
              <Skeleton className="ml-2 h-3 w-10" />
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
        <p className="mb-2 font-medium text-red-500">Unable to load conversations</p>
        <p className="mb-4 text-sm text-slate-500">{error}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
          <MessageSquare className="h-8 w-8 text-indigo-500" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-slate-800">No conversations yet</h3>
        <p className="mx-auto mb-6 max-w-sm text-slate-500">
          Connect with other users to start exchanging skills and sharing knowledge
        </p>
        <Button
          variant="default"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          onClick={() => router.push("/skills")}
        >
          <UserPlus className="h-4 w-4" />
          <span>Find Users to Connect With</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with search and refresh */}
      <div className="space-y-3 border-b p-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-slate-800">Conversations ({conversations.length})</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-slate-600 hover:text-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-slate-500">No conversations match your search</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const isActive = pathname === `/messages/${conversation.connection_id}`;

              // Format time safely
              let timeAgo = "";
              try {
                if (conversation.last_message_time) {
                  const date = new Date(conversation.last_message_time);
                  if (!isNaN(date.getTime())) {
                    timeAgo = formatDistanceToNow(date, { addSuffix: true });
                  } else {
                    timeAgo = "Recently";
                  }
                } else {
                  timeAgo = "Recently";
                }
              } catch (error) {
                console.error("Date formatting error:", error);
                timeAgo = "Recently";
              }

              return (
                <Link
                  key={conversation.connection_id}
                  href={`/messages/${conversation.connection_id}`}
                  className={`flex cursor-pointer items-center p-4 transition-colors hover:bg-slate-50 ${
                    isActive ? "border-l-4 border-l-indigo-500 bg-indigo-50 hover:bg-indigo-50" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${conversation.partner_name}`}
                        alt={conversation.partner_name}
                      />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        {conversation.partner_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unread_count > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="ml-4 min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="truncate font-medium text-slate-800">
                        {conversation.partner_name}
                      </h4>
                      <span className="flex items-center whitespace-nowrap text-xs text-slate-500">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {timeAgo}
                      </span>
                    </div>
                    <p
                      className={`truncate text-sm ${
                        conversation.unread_count > 0
                          ? "font-medium text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      {conversation.last_message}
                    </p>
                    {conversation.partner_email && (
                      <p className="truncate text-xs text-slate-400">
                        {conversation.partner_email}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
