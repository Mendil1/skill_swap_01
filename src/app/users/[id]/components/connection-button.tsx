"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, Check, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  createConnectionRequestNotification,
  createConnectionAcceptedNotification,
} from "@/utils/notifications";

interface ConnectionButtonProps {
  currentUserId: string;
  profileUserId: string;
  profileUserName: string;
}

export default function ConnectionButton({
  currentUserId,
  profileUserId,
  profileUserName,
}: ConnectionButtonProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    | "none"
    | "pending-sent"
    | "pending-received"
    | "accepted"
    | "rejected"
    | "loading"
  >("loading");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkConnectionStatus() {
      try {
        if (!currentUserId || !profileUserId) return;

        console.log(
          "Checking connection between users:",
          currentUserId,
          profileUserId
        );

        // Check for existing connection between the users
        const { data, error } = await supabase
          .from("connection_requests")
          .select("connection_id, sender_id, receiver_id, status")
          .or(
            `and(sender_id.eq.${currentUserId},receiver_id.eq.${profileUserId}),and(sender_id.eq.${profileUserId},receiver_id.eq.${currentUserId})`
          )
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error code
          throw error;
        }

        if (!data) {
          setConnectionStatus("none");
          setConnectionId(null);
          return;
        }

        console.log("Connection found:", data);

        // Store the connection ID
        setConnectionId(data.connection_id);

        // Determine connection status
        if (data.status === "accepted") {
          setConnectionStatus("accepted");
        } else if (data.status === "rejected") {
          setConnectionStatus("rejected");
        } else if (data.sender_id === currentUserId) {
          setConnectionStatus("pending-sent");
        } else {
          setConnectionStatus("pending-received");
        }
      } catch (err) {
        console.error("Error checking connection status:", err);
        setConnectionStatus("none");
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
        .from("connection_requests")
        .insert({
          sender_id: currentUserId,
          receiver_id: profileUserId,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch current user's name to include in notification
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("full_name")
        .eq("user_id", currentUserId)
        .single();      if (!userError && userData) {
        // Create notification for the connection request
        try {
          await createConnectionRequestNotification(
            profileUserId,
            userData.full_name,
            data.connection_id
          );
        } catch (notificationError) {
          console.error("Warning: Failed to create notification, but connection request was sent:", notificationError);
          // Don't fail the entire operation if notification fails
        }
      }

      setConnectionId(data.connection_id);
      setConnectionStatus("pending-sent");
      toast.success(`Connection request sent to ${profileUserName}`);
    } catch (err) {
      console.error("Error sending connection request:", err);
      
      // Provide more detailed error information
      let errorMessage = "Failed to send connection request";
      if (err && typeof err === 'object') {
        if ('message' in err) {
          errorMessage = `Failed to send connection request: ${err.message}`;
        } else if ('code' in err) {
          errorMessage = `Failed to send connection request (${err.code})`;
        } else {
          errorMessage = `Failed to send connection request: ${JSON.stringify(err)}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = async () => {
    if (!connectionId) return;

    try {
      setIsProcessing(true);

      // First get the connection details to know who sent the request
      const { data: connectionData, error: connectionError } = await supabase
        .from("connection_requests")
        .select("sender_id")
        .eq("connection_id", connectionId)
        .single();

      if (connectionError) throw connectionError;

      const { error } = await supabase
        .from("connection_requests")
        .update({ status: "accepted" })
        .eq("connection_id", connectionId);

      if (error) throw error;

      // Fetch current user's name to include in notification
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("full_name")
        .eq("user_id", currentUserId)
        .single();      if (!userError && userData && connectionData) {
        // Create notification for the connection acceptance
        try {
          await createConnectionAcceptedNotification(
            connectionData.sender_id,
            userData.full_name,
            connectionId
          );
        } catch (notificationError) {
          console.error("Warning: Failed to create notification, but connection was accepted:", notificationError);
          // Don't fail the entire operation if notification fails
        }
      }

      setConnectionStatus("accepted");
      toast.success(`You are now connected with ${profileUserName}`);
    } catch (err) {
      console.error("Error accepting connection request:", err);
      
      // Provide more detailed error information
      let errorMessage = "Failed to accept connection request";
      if (err && typeof err === 'object') {
        if ('message' in err) {
          errorMessage = `Failed to accept connection request: ${err.message}`;
        } else if ('code' in err) {
          errorMessage = `Failed to accept connection request (${err.code})`;
        } else {
          errorMessage = `Failed to accept connection request: ${JSON.stringify(err)}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!connectionId) return;

    try {
      setIsProcessing(true);

      const { error } = await supabase
        .from("connection_requests")
        .update({ status: "rejected" })
        .eq("connection_id", connectionId);

      if (error) throw error;      setConnectionStatus("rejected");
      toast.success(`Connection request rejected`);
    } catch (err) {
      console.error("Error rejecting connection request:", err);
      
      // Provide more detailed error information
      let errorMessage = "Failed to reject connection request";
      if (err && typeof err === 'object') {
        if ('message' in err) {
          errorMessage = `Failed to reject connection request: ${err.message}`;
        } else if ('code' in err) {
          errorMessage = `Failed to reject connection request (${err.code})`;
        } else {
          errorMessage = `Failed to reject connection request: ${JSON.stringify(err)}`;
        }
      }
      
      toast.error(errorMessage);
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
    const link = document.createElement("a");
    link.href = `/messages/${connectionId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Display loading state
  if (connectionStatus === "loading") {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Display status-based buttons
  switch (connectionStatus) {
    case "none":
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

    case "pending-sent":
      return (
        <Button variant="outline" disabled className="flex items-center gap-2">
          <span>Request Pending</span>
        </Button>
      );

    case "pending-received":
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isProcessing}
            className="flex items-center gap-1 border-red-200 text-red-500 hover:bg-red-50"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>Decline</span>
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex items-center gap-1"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span>Accept</span>
          </Button>
        </div>
      );

    case "accepted":
      return (
        <Button onClick={handleMessage} className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Message</span>
        </Button>
      );

    case "rejected":
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
