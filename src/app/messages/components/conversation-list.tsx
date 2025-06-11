"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserPlus,
  Search,
  Clock,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  connection_id: string;
  partner_id: string;
  partner_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function ConversationList({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true);

        // First, get all connections where the user is either sender or receiver and status is accepted
        const { data: connections, error: connectionsError } = await supabase
          .from("connection_requests")
          .select(
            `
            connection_id,
            sender_id,
            receiver_id,
            status,
            created_at,
            sender:users!connection_requests_sender_id_fkey(full_name, user_id),
            receiver:users!connection_requests_receiver_id_fkey(full_name, user_id)
          `
          )
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .eq("status", "accepted");

        if (connectionsError) throw connectionsError;

        if (!connections || connections.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        // For each connection, get the latest message
        const conversationsWithMessages = await Promise.all(
          connections.map(async (connection) => {
            // Determine which user is the conversation partner
            const isUserSender = connection.sender_id === userId;

            // Access the first item if it's an array, otherwise use it directly
            const partnerId = isUserSender
              ? connection.receiver_id
              : connection.sender_id;

            // Safely access sender/receiver data which might be an array
            const senderData = Array.isArray(connection.sender)
              ? connection.sender[0]
              : connection.sender;
            const receiverData = Array.isArray(connection.receiver)
              ? connection.receiver[0]
              : connection.receiver;

            const partnerName = isUserSender
              ? receiverData?.full_name || "Unknown User"
              : senderData?.full_name || "Unknown User";

            // Get the latest message for this connection
            const { data: messages, error: messagesError } = await supabase
              .from("messages")
              .select("*")
              .eq("connection_id", connection.connection_id)
              .order("sent_at", { ascending: false })
              .limit(1);

            if (messagesError) throw messagesError;

            // Get unread message count (messages sent by partner and not read by user)
            // Note: You would need to add a 'read' status column to your messages table
            // This is a placeholder for now
            const unreadCount = 0;

            const lastMessageTime =
              messages && messages.length > 0
                ? messages[0].sent_at
                : connection.created_at || new Date().toISOString();

            return {
              connection_id: connection.connection_id,
              partner_id: partnerId,
              partner_name: partnerName,
              last_message:
                messages && messages.length > 0
                  ? messages[0].content
                  : "No messages yet",
              last_message_time: lastMessageTime,
              unread_count: unreadCount,
            };
          })
        );

        // Sort conversations by last message time, newest first
        const sortedConversations = conversationsWithMessages.sort((a, b) => {
          return (
            new Date(b.last_message_time).getTime() -
            new Date(a.last_message_time).getTime()
          );
        });

        setConversations(sortedConversations);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();

    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [supabase, userId]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((convo) =>
    convo.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-3 space-y-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex items-center p-3 rounded-lg border border-slate-100 animate-pulse"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="ml-3 space-y-2 flex-1">
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-3 w-[200px]" />
              </div>
              <Skeleton className="h-3 w-10 ml-2" />
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-500 font-medium mb-2">
          Unable to load conversations
        </p>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={() => router.refresh()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="bg-indigo-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-indigo-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">
          No conversations yet
        </h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-6">
          Connect with other users to start exchanging skills and sharing
          knowledge
        </p>
        <Button
          variant="default"
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          onClick={() => router.push("/skills")}
        >
          <UserPlus className="h-4 w-4" />
          <span>Find Users to Connect With</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500">No conversations match your search</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const isActive =
                pathname === `/messages/${conversation.connection_id}`;

              // Safely format date with validation
              let timeAgo = "";
              try {
                if (conversation.last_message_time) {
                  const date = new Date(conversation.last_message_time);
                  // Check if date is valid before formatting
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
                  className={`flex items-center p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 hover:bg-indigo-50 border-l-4 border-l-indigo-500"
                      : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${conversation.partner_name}`}
                      />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        {conversation.partner_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-slate-800 truncate">
                        {conversation.partner_name}
                      </h4>
                      <span className="text-xs text-slate-500 whitespace-nowrap flex items-center">
                        <Clock className="h-3 w-3 mr-1 inline" />
                        {timeAgo}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        conversation.unread_count > 0
                          ? "font-medium text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      {conversation.last_message}
                    </p>
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
