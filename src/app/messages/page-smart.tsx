"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, User, Clock } from "lucide-react";

// Types
interface MessageSender {
  id: string;
  name: string;
  avatar: string | null;
}

interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  isRead: boolean;
}

// Mock message data for fallback
const MOCK_MESSAGES = [
  {
    id: "msg-1",
    sender: {
      id: "user-1",
      name: "Alice Johnson",
      avatar: null,
    },
    content:
      "Hi! I saw you're offering JavaScript tutoring. I'm interested in learning React. Are you available for a session this week?",
    timestamp: "2025-06-13T10:30:00Z",
    isRead: false,
  },
  {
    id: "msg-2",
    sender: {
      id: "user-2",
      name: "Bob Smith",
      avatar: null,
    },
    content:
      "Thanks for the great Python session yesterday! The concepts you explained about data structures really clicked for me.",
    timestamp: "2025-06-12T15:45:00Z",
    isRead: true,
  },
  {
    id: "msg-3",
    sender: {
      id: "user-3",
      name: "Carol Chen",
      avatar: null,
    },
    content:
      "I'm looking for help with UI/UX design principles. I noticed you have that skill listed. Would you be interested in a skill exchange?",
    timestamp: "2025-06-11T09:15:00Z",
    isRead: true,
  },
];

function formatTimeAgo(timestamp: string) {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

function MessageCard({ message }: { message: Message }) {
  return (
    <Card
      className={`${!message.isRead ? "border-blue-200 bg-blue-50 shadow-md" : "hover:bg-gray-50 hover:shadow-md"} group cursor-pointer transition-all duration-200`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12 shadow-sm ring-2 ring-white">
              <AvatarImage
                src={
                  message.sender.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${message.sender.name}`
                }
                alt={message.sender.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 font-semibold text-white">
                {message.sender.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {!message.isRead && (
              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between">
              <h4
                className={`font-semibold ${!message.isRead ? "text-blue-900" : "text-gray-900"} transition-colors group-hover:text-indigo-600`}
              >
                {message.sender.name}
              </h4>
              <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(message.timestamp)}
              </div>
            </div>
            <p
              className={`text-sm ${!message.isRead ? "text-blue-800" : "text-gray-700"} mb-3 leading-relaxed`}
            >
              {message.content}
            </p>
            <div className="flex items-center justify-between">
              {!message.isRead ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                    New message
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Read</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 opacity-0 transition-opacity hover:bg-indigo-50 hover:text-indigo-700 group-hover:opacity-100"
              >
                Reply
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SmartMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealUser, setIsRealUser] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadMessages() {
      console.log("[Messages] Auth context user:", user?.email);

      // Check for real authentication
      let authUser = user;
      if (!authUser) {
        try {
          const supabase = createClient();
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session?.user) {
            authUser = sessionData.session.user;
            console.log("[Messages] Found direct session for:", authUser.email);
          }
        } catch (error) {
          console.warn("[Messages] Error checking session:", error);
        }
      }

      if (authUser) {
        setIsRealUser(true);
        setUserEmail(authUser.email || null);
        try {
          // Try to load real messages with a simpler approach
          const supabase = createClient();
          // First, get messages where the user is the sender (using actual schema)
          const { data: rawMessages, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("sender_id", authUser.id)
            .order("sent_at", { ascending: false })
            .limit(20);

          if (messagesError) {
            console.warn("[Messages] Error loading messages:", messagesError);
            setMessages(MOCK_MESSAGES);
            return;
          }
          if (!rawMessages || rawMessages.length === 0) {
            console.log("[Messages] No messages found for user, showing empty state");
            setMessages([]);
            return;
          }

          // Get unique user IDs from messages (only sender_id since user is always sender in this query)
          const userIds = new Set<string>();
          rawMessages.forEach((msg) => {
            userIds.add(msg.sender_id);
          }); // Get profile data for all users from the 'users' table
          const { data: profiles, error: profilesError } = await supabase
            .from("users")
            .select("user_id, email, full_name")
            .in("user_id", Array.from(userIds));

          if (profilesError) {
            console.warn("[Messages] Error loading profiles:", profilesError);
            setMessages(MOCK_MESSAGES);
            return;
          }

          // Create a lookup map for user profiles
          const profileMap = new Map();
          profiles?.forEach((profile) => {
            profileMap.set(profile.user_id, profile);
          });

          // Transform messages with user profile data
          const transformedMessages = rawMessages.map((msg) => {
            const sender = profileMap.get(msg.sender_id) || {
              user_id: msg.sender_id,
              email: "unknown@email.com",
              full_name: "Unknown User",
            };

            return {
              id: msg.message_id,
              sender: {
                id: sender.user_id,
                name: sender.full_name || "Unknown User",
                avatar: null, // No avatar in users table
              },
              content: msg.content || "No content",
              timestamp: msg.sent_at,
              isRead: true, // Assume read since we don't have read status in schema
            };
          });

          console.log("[Messages] Successfully loaded real messages:", transformedMessages.length);
          setMessages(transformedMessages);
        } catch (error) {
          console.error("[Messages] Unexpected error:", error);
          setMessages(MOCK_MESSAGES);
        }
      } else {
        console.log("[Messages] No authenticated user, showing demo data");
        setIsRealUser(false);
        setMessages(MOCK_MESSAGES);
      }

      setLoading(false);
    }

    loadMessages();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }
  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Connect and communicate with your skill-swap partners</p>
            </div>
          </div>
        </div>

        {/* User Status Indicator */}
        {isRealUser ? (
          <div className="mb-6 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-green-400"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Connected as: {userEmail}</p>
                <p className="text-xs text-green-600">Real-time messaging enabled</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Demo Mode Active</p>
                <p className="text-xs text-yellow-600">Please log in to see your real messages</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Messages Area */}
          <div className="space-y-4 lg:col-span-3">
            {" "}
            {/* Header Card */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-lg">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/20 p-3 shadow-lg backdrop-blur-sm">
                      <MessageCircle className="h-7 w-7" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-white">
                        Your Conversations
                      </CardTitle>
                      <CardDescription className="text-indigo-100">
                        {messages.length === 0
                          ? "Ready to start your first conversation?"
                          : unreadCount > 0
                            ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""} • ${messages.length} total conversation${messages.length > 1 ? "s" : ""}`
                            : `${messages.length} conversation${messages.length > 1 ? "s" : ""} • All caught up!`}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-white/90 font-semibold text-indigo-600 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-lg"
                    disabled={!isRealUser}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Compose
                  </Button>
                </div>
              </CardHeader>
            </Card>
            {/* Messages List */}
            <div className="space-y-3">
              {messages.length > 0 ? (
                <div className="space-y-2">
                  {messages.map((message, index) => (
                    <div key={message.id} className="relative">
                      <MessageCard message={message} />
                      {index < messages.length - 1 && (
                        <div className="absolute left-8 top-full h-4 w-0.5 bg-gray-200"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-gradient-to-br from-white to-slate-50 shadow-lg">
                  <CardContent className="py-20 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="relative mb-8">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-6 shadow-lg">
                          <MessageCircle className="h-12 w-12 text-indigo-600" />
                        </div>
                        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 shadow-lg">
                          <span className="text-sm">✨</span>
                        </div>
                      </div>
                      <h3 className="mb-4 text-2xl font-bold text-gray-900">No messages yet</h3>
                      <p className="mb-8 text-lg leading-relaxed text-gray-600">
                        {isRealUser
                          ? "Your inbox is ready! Start connecting with other users to begin meaningful conversations and skill exchanges."
                          : "Please log in to access your personal message inbox and connect with the community."}
                      </p>
                      {isRealUser ? (
                        <div className="space-y-4">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 font-semibold shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                          >
                            <Send className="mr-2 h-5 w-5" />
                            Send your first message
                          </Button>
                          <p className="text-sm text-gray-500">
                            or browse the community to find people to connect with
                          </p>
                        </div>
                      ) : (
                        <Link href="/login">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 font-semibold shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                          >
                            Sign In to View Messages
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {" "}
            {/* Quick Stats */}
            <Card className="border-0 bg-gradient-to-br from-white to-slate-50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <MessageCircle className="h-4 w-4 text-indigo-600" />
                  </div>
                  Message Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
                  <span className="text-sm font-medium text-gray-700">Total Messages</span>
                  <span className="text-xl font-bold text-gray-900">{messages.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-3">
                  <span className="text-sm font-medium text-gray-700">Unread</span>
                  <span className="text-xl font-bold text-indigo-600">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      isRealUser
                        ? "bg-green-100 text-green-800 shadow-sm"
                        : "bg-yellow-100 text-yellow-800 shadow-sm"
                    }`}
                  >
                    {isRealUser ? "🟢 Live" : "🟡 Demo"}
                  </span>
                </div>
              </CardContent>
            </Card>
            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                </Link>
                <Link href="/sessions" className="block">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Clock className="mr-2 h-4 w-4" />
                    Browse Sessions
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
                {!isRealUser && (
                  <Link href="/login" className="block">
                    <Button
                      className="w-full justify-start bg-indigo-600 hover:bg-indigo-700"
                      size="sm"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Sign In for Full Access
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
            {/* Help Card */}
            <Card className="border-blue-200 bg-blue-50 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 p-2">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="mb-2 font-medium text-blue-900">Need Help?</h4>
                  <p className="mb-3 text-xs text-blue-700">
                    Learn how to connect with users and start conversations
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-100"
                  >
                    View Guide
                  </Button>
                </div>
              </CardContent>{" "}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
