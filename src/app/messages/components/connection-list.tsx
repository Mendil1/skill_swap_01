"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Connection {
  connection_id: string;
  partner_id: string;
  partner_name: string;
  status: "pending" | "accepted" | "rejected";
  is_sender: boolean;
  created_at: string;
}

export default function ConnectionList({ userId }: { userId: string }) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchConnections() {
      try {
        setLoading(true);

        // Get all connections where the user is either sender or receiver
        const { data, error: connectionsError } = await supabase
          .from("connection_requests")
          .select(
            `
            connection_id,
            sender_id,
            receiver_id,
            status,
            created_at,
            sender:users!connection_requests_sender_id_fkey(full_name, user_id),
            receiver:users!connection_requests_receiver_id_fkey(full_name, user_id)
          `
          )
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order("created_at", { ascending: false });

        if (connectionsError) throw connectionsError;

        if (!data || data.length === 0) {
          setConnections([]);
          setLoading(false);
          return;
        }

        // Process the connections data
        const processedConnections = data.map((connection) => {
          const isSender = connection.sender_id === userId;
          const partnerId = isSender
            ? connection.receiver_id
            : connection.sender_id;
          const partnerName = isSender
            ? connection.receiver.full_name
            : connection.sender.full_name;

          return {
            connection_id: connection.connection_id,
            partner_id: partnerId,
            partner_name: partnerName || "Unknown User",
            status: connection.status,
            is_sender: isSender,
            created_at: connection.created_at,
          };
        });

        setConnections(processedConnections);
      } catch (err) {
        console.error("Error fetching connections:", err);
        setError("Failed to load connections");
      } finally {
        setLoading(false);
      }
    }

    fetchConnections();

    // Set up real-time subscription for connection changes
    const connectionsSubscription = supabase
      .channel("connections")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connection_requests",
        },
        () => {
          fetchConnections();
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(connectionsSubscription);
    };
  }, [supabase, userId]);

  const handleAccept = async (connectionId: string) => {
    try {
      setProcessingIds((prev) => [...prev, connectionId]);

      const { error } = await supabase
        .from("connection_requests")
        .update({ status: "accepted" })
        .eq("connection_id", connectionId)
        .eq("receiver_id", userId);

      if (error) throw error;

      toast.success("Connection accepted");
      router.refresh();
    } catch (err) {
      console.error("Error accepting connection:", err);
      toast.error("Failed to accept connection");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== connectionId));
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      setProcessingIds((prev) => [...prev, connectionId]);

      const { error } = await supabase
        .from("connection_requests")
        .update({ status: "rejected" })
        .eq("connection_id", connectionId)
        .eq("receiver_id", userId);

      if (error) throw error;

      toast.success("Connection rejected");
      router.refresh();
    } catch (err) {
      console.error("Error rejecting connection:", err);
      toast.error("Failed to reject connection");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== connectionId));
    }
  };

  const handleMessage = (connectionId: string) => {
    console.log("Navigating to conversation with ID:", connectionId);
    
    // Use direct anchor tag navigation to force a complete page refresh
    const link = document.createElement('a');
    link.href = `/messages/${connectionId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 mb-4">
          You don't have any connections yet
        </p>
        <Button variant="outline" onClick={() => router.push("/skills")}>
          Find Users to Connect With
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending Connection Requests (received) */}
      {connections.filter((c) => c.status === "pending" && !c.is_sender)
        .length > 0 && (
        <div>
          <h3 className="font-medium text-lg mb-2">Pending Requests</h3>
          <div className="space-y-2 divide-y">
            {connections
              .filter((c) => c.status === "pending" && !c.is_sender)
              .map((connection) => (
                <div
                  key={connection.connection_id}
                  className="flex items-center p-3 rounded-lg"
                >
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${connection.partner_name}`}
                    />
                    <AvatarFallback>
                      {connection.partner_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium truncate">
                        {connection.partner_name}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {new Date(connection.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Wants to connect with you
                    </p>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full text-red-500 border-red-200"
                      onClick={() => handleReject(connection.connection_id)}
                      disabled={processingIds.includes(
                        connection.connection_id
                      )}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full text-green-500 border-green-200"
                      onClick={() => handleAccept(connection.connection_id)}
                      disabled={processingIds.includes(
                        connection.connection_id
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Pending Connection Requests (sent) */}
      {connections.filter((c) => c.status === "pending" && c.is_sender).length >
        0 && (
        <div>
          <h3 className="font-medium text-lg mb-2">Sent Requests</h3>
          <div className="space-y-2 divide-y">
            {connections
              .filter((c) => c.status === "pending" && c.is_sender)
              .map((connection) => (
                <div
                  key={connection.connection_id}
                  className="flex items-center p-3 rounded-lg"
                >
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${connection.partner_name}`}
                    />
                    <AvatarFallback>
                      {connection.partner_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium truncate">
                        {connection.partner_name}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {new Date(connection.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Waiting for response
                    </p>
                  </div>

                  <div className="px-4 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                    Pending
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Accepted Connections */}
      {connections.filter((c) => c.status === "accepted").length > 0 && (
        <div>
          <h3 className="font-medium text-lg mb-2">Active Connections</h3>
          <div className="space-y-2 divide-y">
            {connections
              .filter((c) => c.status === "accepted")
              .map((connection) => (
                <div
                  key={connection.connection_id}
                  className="flex items-center p-3 rounded-lg"
                >
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${connection.partner_name}`}
                    />
                    <AvatarFallback>
                      {connection.partner_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium truncate">
                        {connection.partner_name}
                      </h4>
                      <span className="text-xs text-slate-500">
                        Connected on{" "}
                        {new Date(connection.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleMessage(connection.connection_id)}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Message
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
