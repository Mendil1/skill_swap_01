"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { MessageCircle, Send, Clock } from "lucide-react";

// Type definitions
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
  connectionId: string;
}

interface Conversation {
  id: string;
  participant: MessageSender;
  lastMessage: Message;
  unreadCount: number;
  totalMessages: number;
}

interface ConversationDialogProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

function ConversationDialog({ conversation, messages, currentUserId }: ConversationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort messages for this conversation
  const conversationMessages = messages
    .filter(msg => msg.connectionId === conversation.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      console.log("Sending message:", newMessage, "to connection:", conversation.id);
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: conversation.id,
          content: newMessage
        })
      });      const result = await response.json();

      if (!response.ok) {
        console.error("API Error:", response.status, result);
        throw new Error(result.error || 'Failed to send message');
      }
      
      console.log("Message sent successfully:", result);
      setNewMessage("");
      
      // Refresh the page to show the new message
      window.location.reload();
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to send message: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card 
        className="hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={conversation.participant.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conversation.participant.name}`}
                  alt={conversation.participant.name}
                />
                <AvatarFallback className={conversation.unreadCount > 0 ? 'bg-blue-100 text-blue-700' : ''}>
                  {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {conversation.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold ${conversation.unreadCount > 0 ? 'text-blue-900' : 'text-gray-900'} hover:text-blue-600 transition-colors`}>
                  {conversation.participant.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(conversation.lastMessage.timestamp)}
                </div>
              </div>
              
              <p className={`text-sm ${conversation.unreadCount > 0 ? 'text-blue-800 font-medium' : 'text-gray-600'} line-clamp-2 mb-2`}>
                {conversation.lastMessage.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {conversation.unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                      {conversation.unreadCount} new
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    {conversation.totalMessages} message{conversation.totalMessages !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <MessageCircle className="h-3 w-3" />
                  <span>Click to open</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={conversation.participant.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conversation.participant.name}`}
                  alt={conversation.participant.name}
                />
                <AvatarFallback>
                  {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle>{conversation.participant.name}</DialogTitle>
                <DialogDescription>
                  {conversation.totalMessages} message{conversation.totalMessages !== 1 ? 's' : ''} • Last active {formatTimeAgo(conversation.lastMessage.timestamp)}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto max-h-96 space-y-4 my-4">
            {conversationMessages.length > 0 ? (
              conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      message.sender.id === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender.id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTimeAgo(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex-shrink-0 border-t pt-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="self-end"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { ConversationDialog, type Conversation, type Message, type MessageSender };
