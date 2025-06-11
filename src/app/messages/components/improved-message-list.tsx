"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  CheckCheck,
  Clock,
  AlertCircle,
  MessageSquareHeart,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

interface Message {
  message_id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
}

interface PartnerInfo {
  name: string;
  avatar: string;
  email?: string;
}

interface ImprovedMessageListProps {
  conversationId: string;
  userId: string;
}

export default function ImprovedMessageList({
  conversationId,
  userId,
}: ImprovedMessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const supabase = useMemo(() => createClient(), []);

  // Group messages by day
  const groupedMessages = useMemo(() => {
    const groups: { [date: string]: Message[] } = {};
    messages.forEach((message) => {
      const messageDate = message.sent_at || new Date().toISOString();
      const date = new Date(messageDate).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  }, [messages]);

  const scrollToBottom = (force = false) => {
    if (force || isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowNewMessageAlert(false);
      setNewMessageCount(0);
    }
  };

  // Track scroll position
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottomRef.current && showNewMessageAlert) {
      setShowNewMessageAlert(false);
      setNewMessageCount(0);
    }
  };

  // Main effect - initialize chat and fetch data
  useEffect(() => {
    if (!conversationId || !userId) {
      console.log('❌ Missing conversationId or userId');
      setError('Missing conversation or user information');
      setLoading(false);
      return;
    }

    console.log('🚀 Initializing chat for conversation:', conversationId, 'user:', userId);
    
    let isMounted = true;
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch connection info to get partner details
        console.log('🔍 Fetching connection info...');
        const { data: connectionData, error: connectionError } = await supabase
          .from("connection_requests")
          .select(`
            sender_id,
            receiver_id,
            sender:users!connection_requests_sender_id_fkey(user_id, full_name, email),
            receiver:users!connection_requests_receiver_id_fkey(user_id, full_name, email)
          `)
          .eq("connection_id", conversationId)
          .single();

        if (!isMounted) return;

        if (connectionError || !connectionData) {
          console.error('❌ Connection error:', connectionError);
          setError("Connection not found");
          setLoading(false);
          return;
        }

        // Determine partner info
        const isUserSender = connectionData.sender_id === userId;
        const senderData = Array.isArray(connectionData.sender) ? connectionData.sender[0] : connectionData.sender;
        const receiverData = Array.isArray(connectionData.receiver) ? connectionData.receiver[0] : connectionData.receiver;
        const partner = isUserSender ? receiverData : senderData;

        const partnerInfo = {
          name: partner?.full_name || partner?.email || "Unknown User",
          email: partner?.email,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.full_name || "User"}`,
        };

        setPartnerInfo(partnerInfo);
        console.log('✅ Partner info set:', partnerInfo.name);

        // 2. Fetch messages
        console.log('📨 Fetching messages...');
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("message_id, connection_id, sender_id, content, sent_at")
          .eq("connection_id", conversationId)
          .order("sent_at", { ascending: true });

        if (!isMounted) return;

        if (messagesError) {
          console.error('❌ Messages error:', messagesError);
          setError("Failed to load messages");
          setLoading(false);
          return;
        }

        console.log(`✅ Fetched ${messagesData?.length || 0} messages`);
        setMessages(messagesData || []);

        // 3. Setup real-time subscription
        console.log('🔄 Setting up real-time subscription...');
        realtimeChannel = supabase
          .channel(`messages:${conversationId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `connection_id=eq.${conversationId}`,
            },
            (payload: { new: Message }) => {
              console.log("📨 Real-time message received:", payload);

              if (!isMounted) return;

              setMessages((currentMessages) => {
                // Prevent duplicates
                if (currentMessages.some(m => m.message_id === payload.new.message_id)) {
                  return currentMessages;
                }

                const newMessages = [...currentMessages, payload.new];
                const isFromCurrentUser = payload.new.sender_id === userId;

                // Show alert if user scrolled up and message is from partner
                if (!isNearBottomRef.current && !isFromCurrentUser) {
                  setShowNewMessageAlert(true);
                  setNewMessageCount(prev => prev + 1);
                } else {
                  // Auto-scroll for own messages or if at bottom
                  setTimeout(() => scrollToBottom(isFromCurrentUser), 50);
                }

                return newMessages;
              });
            }
          )
          .subscribe();

        setLoading(false);
        
        // Scroll to bottom after initial load
        setTimeout(() => scrollToBottom(true), 200);

      } catch (err) {
        console.error("❌ Error initializing chat:", err);
        if (isMounted) {
          setError("Failed to load conversation");
          setLoading(false);
        }
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [conversationId, userId, supabase]);

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper functions
  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getDateLabel = (dateStr: string) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return dateStr;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 space-y-4 w-full">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquareHeart className="h-5 w-5 animate-pulse" />
          <span>Loading messages...</span>
        </div>
        {Array(5)
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

  // Error state
  if (error) {
    return (
      <div className="p-10 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-500 font-medium mb-2">Unable to load messages</p>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reload Page
        </Button>
      </div>
    );
  }

  // Empty state
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

  // Main messages display
  return (
    <div className="relative h-full flex flex-col">
      {/* Debug info - shows in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-green-100 p-2 text-xs border-b">
          ✅ {messages.length} messages loaded | Partner: {partnerInfo?.name || 'Loading...'}
        </div>
      )}

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="p-4 space-y-6 w-full overflow-y-auto flex-1"
      >
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-3">
            {/* Date separator */}
            <div className="text-center">
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium shadow-sm">
                {getDateLabel(date)}
              </span>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const isCurrentUser = message.sender_id === userId;
              const showAvatar =
                index === 0 ||
                dateMessages[index - 1]?.sender_id !== message.sender_id;

              const timeFormatted = formatTime(message.sent_at || new Date().toISOString());
              const isRecent =
                new Date().getTime() - new Date(message.sent_at || new Date().toISOString()).getTime() < 60000;

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
                    {/* Avatar */}
                    {!isCurrentUser && showAvatar ? (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={partnerInfo?.avatar}
                          alt={partnerInfo?.name}
                        />
                        <AvatarFallback className="bg-emerald-100 text-emerald-600">
                          {partnerInfo?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : !isCurrentUser ? (
                      <div className="w-8 flex-shrink-0" />
                    ) : null}

                    {/* Message bubble */}
                    <div
                      className={`relative rounded-lg py-2 px-3 text-sm hover:shadow-md transition-shadow ${
                        isCurrentUser
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {/* Timestamp and status */}
                      <div
                        className={`flex items-center gap-1 text-xs mt-1 ${
                          isCurrentUser ? "text-indigo-200" : "text-slate-400"
                        } opacity-70 group-hover:opacity-100 transition-opacity`}
                      >
                        <span>{timeFormatted}</span>
                        {isCurrentUser && (
                          isRecent ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <CheckCheck className="h-3 w-3" />
                          )
                        )}
                      </div>
                    </div>

                    {/* Current user avatar */}
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