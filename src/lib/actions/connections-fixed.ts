"use server";

import { createClient } from "@/utils/supabase/server";
import { Connection } from "@/types/sessions";

export async function getConnections(): Promise<{ connections: Connection[]; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { connections: [] };
  }

  try {
    // Get accepted connections where the current user is either sender or receiver
    const { data: connectionRequests, error } = await supabase
      .from("connection_requests")
      .select(
        "sender_id, receiver_id, sender:users!sender_id(user_id, full_name, email, profile_image_url), receiver:users!receiver_id(user_id, full_name, email, profile_image_url)"
      )
      .eq('status', 'accepted')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (error) {
      console.error("Error fetching connections:", error);
      return { connections: [], error: error.message };
    }

    // Extract unique connections (the other person in each connection)
    const uniqueConnections = new Map<string, Connection>();

    connectionRequests?.forEach((request) => {
      const otherUser = request.sender_id === user.id ? request.receiver : request.sender;
      // Handle both array and object responses from Supabase
      const connection = Array.isArray(otherUser) ? otherUser[0] : otherUser;
      
      if (connection && !uniqueConnections.has(connection.user_id)) {
        uniqueConnections.set(connection.user_id, {
          user_id: connection.user_id,
          full_name: connection.full_name,
          email: connection.email,
          profile_image_url: connection.profile_image_url,
        });
      }
    });

    return { connections: Array.from(uniqueConnections.values()) };
  } catch (error) {
    console.error("Error in getConnections:", error);
    return { 
      connections: [], 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
