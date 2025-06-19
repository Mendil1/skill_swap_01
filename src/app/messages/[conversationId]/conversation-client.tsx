"use client";

import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

interface ConversationClientProps {
  conversationId: string;
}

export default function ConversationClient({ conversationId }: ConversationClientProps) {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (!loading && user && conversationId) {
      loadConversationData();
    } else if (!loading && !user) {
      setLoadingData(false);
    }
  }, [loading, user, conversationId]);
  async function loadConversationData() {
    try {
      setLoadingData(true);
      setError(null);

      // Load connection details (conversation is based on connection_id)
      const { data: connectionData, error: connectionError } = await supabase
        .from("connection_requests")
        .select("*")
        .eq("connection_id", conversationId)
        .single();

      if (connectionError) {
        console.error("Error loading connection:", connectionError);
        setError("Failed to load conversation");
        return;
      }

      // Load messages for this connection
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("connection_id", conversationId)
        .order("sent_at", { ascending: true });
      if (messagesError) {
        console.error("Error loading messages:", messagesError);
        setError("Failed to load messages");
        return;
      }

      setConversation(connectionData);
      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error in loadConversationData:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoadingData(false);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending || !user) return;

    try {
      setSending(true);

      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            content: newMessage.trim(),
            sender_id: user.id,
            connection_id: conversationId,
            sent_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
        return;
      }

      // Add the new message to the local state
      if (data && data[0]) {
        setMessages((prev) => [...prev, data[0]]);
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error in sendMessage:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  // Show loading state only when auth is loading or when we're loading data for a logged-in user
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If no user after auth loading is complete, show login prompt
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Please Log In</h1>
          <p className="mb-4 text-gray-600">You need to be logged in to view conversations.</p>
          <a
            href="/login"
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Show loading state for conversation data
  if (loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{conversation?.title || "Conversation"}</h1>

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="rounded-lg border p-4">
            <div className="mb-2 text-sm text-gray-600">From: {message.sender_id}</div>
            <div>{message.content}</div>
            <div className="mt-2 text-xs text-gray-400">
              {new Date(message.sent_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="mt-8 text-center text-gray-500">No messages in this conversation yet.</div>
      )}

      {/* Message input */}
      <div className="mt-8 rounded-lg border bg-gray-50 p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
