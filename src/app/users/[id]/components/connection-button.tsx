"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, Check, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

interface ConnectionButtonProps {
  currentUserId: string;
  profileUserId: string;
  profileUserName: string;
}

export default function ConnectionButton({ 
  currentUserId, 
  profileUserId,
  profileUserName
}: ConnectionButtonProps) {
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending-sent' | 'pending-received' | 'accepted' | 'rejected' | 'loading'>('loading');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkConnectionStatus() {
      try {
        if (!currentUserId || !profileUserId) return;

        console.log("Checking connection between users:", currentUserId, profileUserId);

        // Check for existing connection between the users
        const { data, error } = await supabase
          .from('connection_requests')
          .select('connection_id, sender_id, receiver_id, status')
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${profileUserId}),and(sender_id.eq.${profileUserId},receiver_id.eq.${currentUserId})`)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error code
          throw error;
        }

        if (!data) {
          setConnectionStatus('none');
          setConnectionId(null);
          return;
        }

        console.log("Connection found:", data);

        // Store the connection ID
        setConnectionId(data.connection_id);

        // Determine connection status
        if (data.status === 'accepted') {
          setConnectionStatus('accepted');
        } else if (data.status === 'rejected') {
          setConnectionStatus('rejected');
        } else if (data.sender_id === currentUserId) {
          setConnectionStatus('pending-sent');
        } else {
          setConnectionStatus('pending-received');
        }
      } catch (err) {
        console.error('Error checking connection status:', err);
        setConnectionStatus('none');
        setConnectionId(null);
      }
    }

    checkConnectionStatus();
  }, [currentUserId, profileUserId, supabase]);

  const handleConnect = async () => {
    try {
      setIsProcessing(true);
      
      // Create a new connection request
      const { data, error } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: currentUserId,
          receiver_id: profileUserId,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setConnectionId(data.connection_id);
      setConnectionStatus('pending-sent');
      toast.success(`Connection request sent to ${profileUserName}`);
    } catch (err) {
      console.error('Error sending connection request:', err);
      toast.error('Failed to send connection request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = async () => {
    if (!connectionId) return;
    
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'accepted' })
        .eq('connection_id', connectionId);
      
      if (error) throw error;
      
      setConnectionStatus('accepted');
      toast.success(`You are now connected with ${profileUserName}`);
    } catch (err) {
      console.error('Error accepting connection request:', err);
      toast.error('Failed to accept connection request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!connectionId) return;
    
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'rejected' })
        .eq('connection_id', connectionId);
      
      if (error) throw error;
      
      setConnectionStatus('rejected');
      toast.success(`Connection request rejected`);
    } catch (err) {
      console.error('Error rejecting connection request:', err);
      toast.error('Failed to reject connection request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMessage = () => {
    if (!connectionId) {
      console.error("Connection ID is missing:", connectionId);
      toast.error("Unable to open conversation. Please try again.");
      return;
    }
    
    console.log("Navigating to conversation with ID:", connectionId);
    
    // Use direct anchor tag navigation to force a complete page refresh
    const link = document.createElement('a');
    link.href = `/messages/${connectionId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Display loading state
  if (connectionStatus === 'loading') {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Display status-based buttons
  switch (connectionStatus) {
    case 'none':
      return (
        <Button 
          onClick={handleConnect} 
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending Request...</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4" />
              <span>Connect</span>
            </>
          )}
        </Button>
      );
      
    case 'pending-sent':
      return (
        <Button 
          variant="outline" 
          disabled 
          className="flex items-center gap-2"
        >
          <span>Request Pending</span>
        </Button>
      );
      
    case 'pending-received':
      return (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReject}
            disabled={isProcessing}
            className="flex items-center gap-1 border-red-200 text-red-500 hover:bg-red-50"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            <span>Decline</span>
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex items-center gap-1"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            <span>Accept</span>
          </Button>
        </div>
      );
      
    case 'accepted':
      return (
        <Button 
          onClick={handleMessage}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Message</span>
        </Button>
      );
      
    case 'rejected':
      return (
        <Button 
          variant="outline" 
          onClick={handleConnect}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          <span>Connect Again</span>
        </Button>
      );
      
    default:
      return null;
  }
}