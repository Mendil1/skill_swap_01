"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCheck,
  Clock,
  AlertCircle,
  MessageSquareHeart,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  message_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
}

export default function MessageList({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerInfo, setPartnerInfo] = useState<{
    name: string;
    avatar: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());  const isNearBottomRef = useRef(true);
  const isUserInputActive = useRef(false);

  // Group messages by day - MOVED TO TOP level to ensure consistent Hook ordering
  const groupedMessages = useMemo(() => {
    const groups: { [date: string]: Message[] } = {};
    messages.forEach((message) => {
      const date = new Date(message.sent_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  }, [messages]);

  // Track if user has scrolled up
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;

    // If scrolled to bottom, hide new message alert
    if (isNearBottomRef.current && showNewMessageAlert) {
      setShowNewMessageAlert(false);
      setNewMessageCount(0);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = (force = false) => {
    if (force || isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowNewMessageAlert(false);
      setNewMessageCount(0);
    }
  };

  // Track text input focus
  useEffect(() => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const handleFocus = () => {
      isUserInputActive.current = true;
    };
    const handleBlur = () => {
      isUserInputActive.current = false;
    };

    textarea.addEventListener("focus", handleFocus);
    textarea.addEventListener("blur", handleBlur);

    return () => {
      textarea.removeEventListener("focus", handleFocus);
      textarea.removeEventListener("blur", handleBlur);
    };
  }, []);
  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabaseRef.current
        .from("messages")
        .select("*")
        .eq("connection_id", conversationId)
        .order("sent_at", { ascending: true });

      if (error) throw error;

      // Update messages state
      setMessages(data || []);

      // If loading for first time, scroll to bottom
      if (loading) {
        setTimeout(scrollToBottom, 100);
      }      return true;
    } catch (err) {
      console.error("Error fetching messages:", {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        conversationId,
        stack: err instanceof Error ? err.stack : undefined
      });
      setError("Failed to load messages");
      return false;
    } finally {
      setLoading(false);
    }
  }, [conversationId, loading, scrollToBottom]); // useCallback dependencies
  // Fetch connection info
  const fetchConnectionInfo = useCallback(async () => {
    try {
      const { data, error } = await supabaseRef.current
        .from("connection_requests")
        .select(
          `
          sender_id,
          receiver_id,
          sender:users!connection_requests_sender_id_fkey(user_id, full_name),
          receiver:users!connection_requests_receiver_id_fkey(user_id, full_name)
        `
        )
        .eq("connection_id", conversationId);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Connection not found");

      const connection = data[0];
      const isUserSender = connection.sender_id === userId;

      // Handle possible array format
      const senderData = Array.isArray(connection.sender)
        ? connection.sender[0]
        : connection.sender;
      const receiverData = Array.isArray(connection.receiver)
        ? connection.receiver[0]
        : connection.receiver;

      const partner = isUserSender ? receiverData : senderData;

      setPartnerInfo({
        name: partner.full_name || "User",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${
          partner.full_name || "User"
        }`,
      });      return true;
    } catch (err) {
      console.error("Error fetching connection info:", {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        conversationId,
        userId,
        stack: err instanceof Error ? err.stack : undefined
      });
      setError("Failed to load conversation partner");
      return false;
    }
  }, [conversationId, userId]); // useCallback dependencies

  // Initialize chat and set up realtime subscription
  useEffect(() => {
    let isMounted = true;
    let realtimeChannel: ReturnType<typeof supabaseRef.current.channel> | null = null;
    const supabase = supabaseRef.current; // Capture ref value for cleanup

    const setupRealtimeSubscription = async () => {
      realtimeChannel = supabase.channel(
        `messages:${conversationId}`
      );

      realtimeChannel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `connection_id=eq.${conversationId}`,
          },
          (payload: { new: Message }) => {
            console.log("Realtime message received:", payload);

            if (!isMounted) return;

            // Update messages state
            setMessages((currentMessages) => {
              // Check if message already exists
              if (
                currentMessages.some(
                  (m) => m.message_id === payload.new.message_id
                )
              ) {
                return currentMessages;
              }

              const newMessages = [...currentMessages, payload.new];

              // Check if the new message is from the current user
              const isFromCurrentUser = payload.new.sender_id === userId;

              // Show new message alert if user has scrolled up and message is not from current user
              if (!isNearBottomRef.current && !isFromCurrentUser) {
                setShowNewMessageAlert(true);
                setNewMessageCount((prev) => prev + 1);
              } else if (isFromCurrentUser || isNearBottomRef.current) {
                // Scroll to bottom for user's own messages or if already at bottom
                setTimeout(() => scrollToBottom(isFromCurrentUser), 50);
              }

              return newMessages;
            });
          }
        )
        .subscribe();
    };

    // Initialize
    const init = async () => {
      setLoading(true);
      await fetchConnectionInfo();
      await fetchMessages();
      await setupRealtimeSubscription();
    };

    init();

    // Polling as fallback
    const pollingInterval = setInterval(() => {
      if (isMounted) fetchMessages();
    }, 15000);    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [fetchConnectionInfo, fetchMessages]);

  // Helper functions
  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

  const getDateLabel = (dateStr: string) => {
    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return dateStr;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Rendering UI based on component state
  if (loading) {
    return (
      <div className="p-4 space-y-4 w-full">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? "justify-start" : "justify-end"
              } animate-pulse`}
            >
              <div className="flex gap-2 max-w-[80%]">
                {i % 2 === 0 && (
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                )}
                <Skeleton
                  className={`h-16 w-64 rounded-lg ${
                    i % 2 === 0 ? "rounded-bl-none" : "rounded-br-none"
                  }`}
                />
                {i % 2 !== 0 && (
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-500 font-medium mb-2">Unable to load messages</p>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLoading(true);
            fetchMessages();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-indigo-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquareHeart className="h-8 w-8 text-indigo-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">
          No messages yet
        </h3>
        <p className="text-slate-500 max-w-xs mx-auto">
          Start your conversation by sending a message below
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="p-4 space-y-6 w-full overflow-y-auto flex-1"
      >
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-3">
            <div className="text-center">
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium shadow-sm">
                {getDateLabel(date)}
              </span>
            </div>

            {dateMessages.map((message, index) => {
              const isCurrentUser = message.sender_id === userId;
              const showAvatar =
                index === 0 ||
                dateMessages[index - 1]?.sender_id !== message.sender_id;
              const timeFormatted = formatTime(message.sent_at);
              const isRecent =
                new Date().getTime() - new Date(message.sent_at).getTime() <
                60000;

              return (
                <div
                  key={message.message_id}
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex ${
                      isCurrentUser ? "flex-row-reverse" : "flex-row"
                    } gap-2 items-end max-w-[85%] group`}
                  >
                    {!isCurrentUser && showAvatar ? (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={partnerInfo?.avatar}
                          alt={partnerInfo?.name}
                        />
                        <AvatarFallback className="bg-emerald-100 text-emerald-600">
                          {partnerInfo?.name.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : !isCurrentUser ? (
                      <div className="w-8 flex-shrink-0" />
                    ) : null}

                    <div
                      className={`relative rounded-lg py-2 px-3 text-sm hover:shadow-md transition-shadow
                      ${
                        isCurrentUser
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <div
                        className={`flex items-center gap-1 text-xs mt-1 ${
                          isCurrentUser ? "text-indigo-200" : "text-slate-400"
                        } opacity-70 group-hover:opacity-100 transition-opacity`}
                      >
                        <span>{timeFormatted}</span>
                        {isCurrentUser &&
                          (isRecent ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <CheckCheck className="h-3 w-3" />
                          ))}
                      </div>
                    </div>

                    {isCurrentUser && showAvatar ? (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=Me`}
                        />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          Me
                        </AvatarFallback>
                      </Avatar>
                    ) : isCurrentUser ? (
                      <div className="w-8 flex-shrink-0" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* New messages indicator */}
      {showNewMessageAlert && (
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white 
                     px-4 py-2 rounded-full shadow-lg cursor-pointer z-10 flex items-center space-x-2
                     hover:bg-indigo-700 transition-colors"
          onClick={() => scrollToBottom(true)}
        >
          <span className="text-sm font-medium">
            {newMessageCount} new{" "}
            {newMessageCount === 1 ? "message" : "messages"}
          </span>
          <ChevronDown className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
