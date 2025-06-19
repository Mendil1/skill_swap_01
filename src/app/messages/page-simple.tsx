"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, User, Clock } from "lucide-react";

// Mock message data for production mode
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

function MessageCard({ message }: { message: (typeof MOCK_MESSAGES)[0] }) {
  return (
    <Card
      className={`${!message.isRead ? "border-blue-200 bg-blue-50" : "hover:bg-gray-50"} cursor-pointer transition-colors`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                message.sender.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${message.sender.name}`
              }
              alt={message.sender.name}
            />
            <AvatarFallback>
              {message.sender.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between">
              <h4 className={`font-medium ${!message.isRead ? "text-blue-900" : "text-gray-900"}`}>
                {message.sender.name}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(message.timestamp)}
              </div>
            </div>
            <p
              className={`text-sm ${!message.isRead ? "text-blue-800" : "text-gray-600"} line-clamp-2`}
            >
              {message.content}
            </p>
            {!message.isRead && (
              <div className="mt-2 flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-medium text-blue-600">New message</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductionMessagesPage() {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === "production");
  }, []);

  const unreadCount = MOCK_MESSAGES.filter((msg) => !msg.isRead).length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Production Mode Banner */}
      {isProduction && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <p className="text-sm font-medium text-yellow-800">
              Production Demo Mode - Showing sample message data
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-indigo-600" />
                <div>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>
                    {unreadCount > 0
                      ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                      : "All messages read"}
                  </CardDescription>
                </div>
              </div>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Messages List */}
        <div className="space-y-3">
          {MOCK_MESSAGES.length > 0 ? (
            MOCK_MESSAGES.map((message) => <MessageCard key={message.id} message={message} />)
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No messages yet</h3>
                <p className="mb-4 text-gray-500">
                  Start connecting with other users to begin conversations
                </p>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Send your first message
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/profile">
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </Link>
              <Link href="/sessions">
                <Button variant="outline">Browse Sessions</Button>
              </Link>
              <Link href="/credits">
                <Button variant="outline">Manage Credits</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Development Note */}
        {!isProduction && (
          <Card className="border-dashed border-gray-300">
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <MessageCircle className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">
                  <strong>Development Mode:</strong> In production, this page would show real user
                  messages and integrate with the full messaging system.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
