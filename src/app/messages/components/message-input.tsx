"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Smile, PaperclipIcon, Info } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Check for duplicate messages (send button double-click prevention)
  const isDuplicateMessage = (content: string) => {
    if (lastSentMessageRef.current === content) {
      const timeSinceLastSend = Date.now() - (lastSentMessageRef.current ? lastSentMessageTimestampRef.current : 0);
      return timeSinceLastSend < 2000; // Prevent duplicate sends within 2 seconds
    }
    return false;
  };

  const lastSentMessageTimestampRef = useRef<number>(0);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Prevent duplicate messages (e.g., from double-clicking send)
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
      
      console.log("Sending message to conversation:", conversationId);
      
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
                  className={`h-9 w-9 rounded-full ${message.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400'} text-white transition-colors`}
                  disabled={sending || !message.trim()}
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message{message.trim() ? '' : ' (type something first)'}</TooltipContent>
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
