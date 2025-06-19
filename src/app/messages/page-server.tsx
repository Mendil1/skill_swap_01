import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageCircle,
  User,
  Clock,
  Search,
  Filter,
  Plus,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { withServerAuth } from "@/lib/auth/server-auth";
import { ConversationDialog } from "@/components/conversation-dialog-fixed";
import type { Conversation, Message } from "@/components/conversation-dialog-fixed";
import type { Database } from "@/types/supabase";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];

// Mock message data for fallback
const MOCK_MESSAGES: Message[] = [
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
    connectionId: "conn-1",
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
    connectionId: "conn-2",
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
    connectionId: "conn-3",
  },
];

function groupMessagesIntoConversations(
  messages: Message[],
  currentUserId: string
): Conversation[] {
  // Group messages by connection ID
  const messagesByConnection = new Map<string, Message[]>();

  messages.forEach((message) => {
    const connectionId = message.connectionId;
    if (!messagesByConnection.has(connectionId)) {
      messagesByConnection.set(connectionId, []);
    }
    messagesByConnection.get(connectionId)!.push(message);
  });

  // Convert to conversations
  const conversations: Conversation[] = [];

  messagesByConnection.forEach((msgs, connectionId) => {
    // Sort messages by timestamp (newest first)
    const sortedMessages = msgs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastMessage = sortedMessages[0];

    // Find the other participant (not the current user)
    const participant =
      lastMessage.sender.id === currentUserId
        ? sortedMessages.find((m) => m.sender.id !== currentUserId)?.sender
        : lastMessage.sender;

    if (participant) {
      const unreadCount = msgs.filter((m) => !m.isRead && m.sender.id !== currentUserId).length;

      conversations.push({
        id: connectionId,
        participant,
        lastMessage,
        unreadCount,
        totalMessages: msgs.length,
      });
    }
  });

  // Sort conversations by last message timestamp
  return conversations.sort(
    (a, b) =>
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
  );
}

// The ConversationCard is now replaced by the interactive ConversationDialog component

async function MessagesPageContent() {
  // Use server-side authentication to load messages
  const { messages, userEmail, userId } = await withServerAuth(async (user, supabase) => {
    console.log("[MessagesPage] Loading messages for user:", user.email);
    console.log("[MessagesPage] User ID from auth:", user.id);

    try {
      // Step 1: Find all connections for this user
      console.log("[Messages] Step 1: Finding user's connections...");
      const { data: connections, error: connectionsError } = await supabase
        .from("connection_requests")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted");
      if (connectionsError) {
        console.warn("[Messages] Error loading connections:", connectionsError);
        return { messages: MOCK_MESSAGES, userEmail: user.email, userId: user.id };
      }

      console.log("[Messages] Found connections:", connections?.length || 0);
      if (!connections || connections.length === 0) {
        console.log("[Messages] No connections found, showing demo data");
        return { messages: MOCK_MESSAGES, userEmail: user.email, userId: user.id };
      } // Step 2: Get messages from those connections
      const connectionIds = connections.map(
        (conn: { connection_id: string }) => conn.connection_id
      );
      console.log("[Messages] Step 2: Getting messages for connections:", connectionIds);

      const { data: realMessages, error: messagesError } = await supabase
        .from("messages")
        .select(
          `
          message_id,
          content,
          sent_at,
          sender_id,
          connection_id
        `
        )
        .in("connection_id", connectionIds)
        .order("sent_at", { ascending: false })
        .limit(50); // Increased limit for better conversation grouping

      if (messagesError) {
        console.warn("[Messages] Error loading messages:", messagesError);
        return { messages: MOCK_MESSAGES, userEmail: user.email, userId: user.id };
      }

      console.log("[Messages] Found raw messages:", realMessages?.length || 0);

      if (!realMessages || realMessages.length === 0) {
        console.log("[Messages] No messages found, showing demo data");
        return { messages: MOCK_MESSAGES, userEmail: user.email, userId: user.id };
      } // Step 3: Get sender details for each message
      const senderIds = [...new Set(realMessages.map((msg: MessageRow) => msg.sender_id))];
      console.log("[Messages] Step 3: Getting sender details for:", senderIds);

      const { data: senders, error: sendersError } = await supabase
        .from("users")
        .select("user_id, full_name, email, profile_image_url")
        .in("user_id", senderIds);

      if (sendersError) {
        console.warn("[Messages] Error loading senders:", sendersError);
        return { messages: MOCK_MESSAGES, userEmail: user.email, userId: user.id };
      }

      console.log("[Messages] Found senders:", senders?.length || 0);

      // Step 4: Transform to display format
      const sendersMap = new Map(
        senders?.map((sender: Partial<UserRow>) => [sender.user_id, sender]) || []
      );
      const transformedMessages: Message[] = realMessages.map((msg: MessageRow) => {
        const sender = sendersMap.get(msg.sender_id) as Partial<UserRow> | undefined;
        return {
          id: msg.message_id,
          sender: {
            id: msg.sender_id,
            name: sender?.full_name || sender?.email || "Unknown User",
            avatar: sender?.profile_image_url || null,
          },
          content: msg.content,
          timestamp: msg.sent_at,
          isRead: msg.sender_id !== user.id, // Mark as read if not sent by current user
          connectionId: msg.connection_id,
        };
      });
      console.log("[Messages] Successfully transformed messages:", transformedMessages.length);
      return { messages: transformedMessages, userEmail: user.email, userId: user.id };
    } catch (error) {
      console.error("[Messages] Error loading messages:", error);
      return { messages: MOCK_MESSAGES, userEmail: user.email, userId: user.id };
    }
  });

  // Group messages into conversations
  const conversations = groupMessagesIntoConversations(messages, userId);
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      {/* Header with User Status */}
      <div className="mb-8">
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium text-green-800">✅ Authenticated as: {userEmail}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
              <MessageCircle className="h-8 w-8 text-indigo-600" />
              Messages
            </h1>
            <p className="mt-1 text-gray-600">
              {conversations.length > 0
                ? `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`
                : "No conversations yet"}
              {totalUnreadCount > 0 && (
                <span className="ml-2 font-semibold text-blue-600">
                  • {totalUnreadCount} unread
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>{" "}
            </CardHeader>
            <CardContent className="space-y-4">
              {conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <ConversationDialog
                    key={conversation.id}
                    conversation={conversation}
                    messages={messages}
                    currentUserId={userId}
                  />
                ))
              ) : (
                <div className="py-12 text-center">
                  <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">No conversations yet</h3>
                  <p className="mx-auto mb-6 max-w-sm text-gray-500">
                    Start connecting with other users to begin meaningful conversations about skill
                    sharing.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Start your first conversation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                <div>
                  <p className="text-sm font-medium text-blue-900">Unread Messages</p>
                  <p className="text-2xl font-bold text-blue-600">{totalUnreadCount}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
                </div>
                <User className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/profile" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </Link>
              <Link href="/sessions" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Browse Sessions
                </Button>
              </Link>
              <Link href="/credits" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Manage Credits
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MessagesPageLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-muted h-6 w-6 animate-pulse rounded" />
                <div>
                  <div className="bg-muted mb-2 h-6 w-24 animate-pulse rounded" />
                  <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                </div>
              </div>
              <div className="bg-muted h-9 w-28 animate-pulse rounded" />
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
                  <div className="flex-1">
                    <div className="bg-muted mb-2 h-4 w-1/4 animate-pulse rounded" />
                    <div className="bg-muted mb-1 h-4 w-3/4 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesPageLoading />}>
      <MessagesPageContent />
    </Suspense>
  );
}
