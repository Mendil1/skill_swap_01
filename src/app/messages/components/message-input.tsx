"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Smile, PaperclipIcon, Info } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/ui/tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import eventBus from "@/utils/event-bus";
import { sendMessageNotification, processPendingNotifications } from "@/utils/notification-retry";

export default function MessageInput({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabaseRef = useRef(createClient());
  const lastSentMessageRef = useRef<string | null>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [message]);

  // Check for pending notifications on component mount
  useEffect(() => {
    processPendingNotifications();
  }, []);

  const lastSentMessageTimestampRef = useRef<number>(0);

  // Check for duplicate messages
  const isDuplicateMessage = (content: string) => {
    if (lastSentMessageRef.current === content) {
      const timeSinceLastSend =
        Date.now() - lastSentMessageTimestampRef.current;
      return timeSinceLastSend < 2000; // Prevent duplicate sends within 2 seconds
    }
    return false;
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Prevent duplicate messages
    if (isDuplicateMessage(trimmedMessage)) {
      console.log("Preventing duplicate message send");
      return;
    }

    try {
      setSending(true);

      // Save message for duplicate check
      lastSentMessageRef.current = trimmedMessage;
      lastSentMessageTimestampRef.current = Date.now();

      // Clear input immediately for better UX
      setMessage("");

      // Insert message into database
      const { data, error } = await supabaseRef.current
        .from("messages")
        .insert({
          connection_id: conversationId,
          sender_id: userId,
          content: trimmedMessage,
        })
        .select();

      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }

      console.log("Message sent successfully:", data);

      // Get connection details to find recipient
      const { data: connectionData, error: connectionError } =
        await supabaseRef.current
          .from("connection_requests")
          .select("sender_id, receiver_id")
          .eq("connection_id", conversationId)
          .single();

      if (connectionError) {
        console.error("Error fetching connection details:", connectionError);
        throw connectionError;
      }

      // Determine recipient ID
      const recipientId =
        connectionData.sender_id === userId
          ? connectionData.receiver_id
          : connectionData.sender_id;

      console.log("Creating notification for recipient ID:", recipientId);

      // Get sender's name for the notification
      const { data: userData, error: userError } = await supabaseRef.current
        .from("users")
        .select("full_name")
        .eq("user_id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user details:", userError);
        throw userError;
      }

      console.log("Sender name for notification:", userData.full_name);      // Create a server-side notification
      try {
        // Use our retry mechanism for reliable notification delivery
        sendMessageNotification(recipientId, userData.full_name, conversationId)
          .then(success => {
            console.log("Message notification sent successfully:", success);
          })
          .catch(err => {
            console.error("Error with notification retry:", err);
          });
      } catch (serverError) {
        console.error("Error creating server notification:", serverError);
      }

      // Create a simple browser notification storage as fallback
      // Store in localStorage
      try {
        // Store sender ID for matching
        localStorage.setItem("currentUserId", userId);

        // Get existing notifications
        let existingNotifications = [];
        try {
          existingNotifications = JSON.parse(
            localStorage.getItem("local_notifications") || "[]"
          );
        } catch (parseError) {
          console.error("Error parsing localStorage, resetting:", parseError);
          existingNotifications = [];
        }

        console.log(
          "Existing notifications in localStorage:",
          existingNotifications.length
        );

        // Get recipient's email if available
        let recipientEmail = "";
        try {
          const { data: recipientData, error: recipientError } =
            await supabaseRef.current
              .from("users")
              .select("email")
              .eq("user_id", recipientId)
              .single();

          if (recipientData && !recipientError) {
            recipientEmail = recipientData.email;
            console.log("Found recipient email:", recipientEmail);
          }
        } catch (emailError) {
          console.error("Error fetching recipient email:", emailError);
        }

        // Create a new notification
        const newNotification = {
          id: `local-${Date.now()}`,
          recipient_id: recipientId,
          recipient_email: recipientEmail, // Add the email for better matching
          sender_id: userId,
          sender_name: userData.full_name,
          message: `${userData.full_name} sent you a message`,
          type: "message",
          conversation_id: conversationId,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        console.log("Created new notification:", newNotification);

        // Add to existing notifications
        existingNotifications.push(newNotification);

        // Save back to localStorage
        localStorage.setItem(
          "local_notifications",
          JSON.stringify(existingNotifications)
        );
        console.log("Saved updated notifications to localStorage");

        // Store recipient ID for later matching
        if (recipientId) {
          localStorage.setItem("lastRecipientId", recipientId);
        }        // Trigger custom event for notification bell
        try {
          console.log("Dispatching notification events");

          // Use our event bus for reliable event emission
          eventBus.emit("new-notification", newNotification);

          // Also use the legacy approach for backward compatibility
          const notificationEvent = new CustomEvent("new-notification", {
            detail: newNotification,
          });
          window.dispatchEvent(notificationEvent);

          window.dispatchEvent(
            new CustomEvent("local-notification", {
              detail: newNotification,
            })
          );

          // Emit a specific message event that notification components can listen for
          eventBus.emit("new-message", {
            senderId: userId,
            recipientId: recipientId,
            conversationId: conversationId,
            timestamp: Date.now()
          });

          console.log("Events dispatched successfully");

          // For cross-tab notification, also store the current time of the last notification
          localStorage.setItem("notification_timestamp", Date.now().toString());
        } catch (eventError) {
          console.error("Error dispatching notification event:", eventError);
        }

        console.log("Local notification created for recipient", recipientId);
      } catch (storageError) {
        console.error("Error creating local notification:", storageError);
      }

      // Focus the textarea after sending
      textareaRef.current?.focus();
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message. Please try again.");

      // Restore the message if sending failed
      setMessage(trimmedMessage);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (but not with Shift+Enter which adds a new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Show emoji picker (placeholder for now)
  const handleEmojiClick = () => {
    toast.info("Emoji picker coming soon!");
  };

  // Show file attachment dialog (placeholder for now)
  const handleAttachmentClick = () => {
    toast.info("File attachments coming soon!");
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSendMessage} className="w-full">
        <div className="flex items-end rounded-lg border bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-300">
          {/* Message area */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              className="resize-none max-h-[150px] border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-2"
              rows={1}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  onClick={handleEmojiClick}
                  disabled={sending}
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add emoji</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  onClick={handleAttachmentClick}
                  disabled={sending}
                >
                  <PaperclipIcon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  className={`h-9 w-9 rounded-full ${
                    message.trim()
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-indigo-400"
                  } text-white transition-colors`}
                  disabled={sending || !message.trim()}
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Send message{message.trim() ? "" : " (type something first)"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-400 flex items-center px-2">
          <Info className="h-3 w-3 mr-1" />
          <span>Press Shift+Enter for a new line</span>
        </div>
      </form>
    </TooltipProvider>
  );
}
