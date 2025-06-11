"use server";

import { createClient } from "@/utils/supabase/server";
import { Connection } from "@/types/sessions";

export async function getConnections(): Promise<{ connections: Connection[]; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { connections: [] };
  }  try {
    // Fetch accepted connections where the user is either sender or receiver
    const { data: connectionRequests, error } = await supabase
      .from("connection_requests")
      .select(`
        sender_id, 
        receiver_id, 
        sender:users!connection_requests_sender_id_fkey(user_id, full_name, email, profile_image_url), 
        receiver:users!connection_requests_receiver_id_fkey(user_id, full_name, email, profile_image_url)
      `)
      .eq('status', 'accepted')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    console.log("getConnections debug - user.id:", user.id);
    console.log("getConnections debug - query error:", error);
    console.log("getConnections debug - connectionRequests count:", connectionRequests?.length || 0);

    if (error) {
      console.error("Error fetching connections:", error);
      return { connections: [], error: error.message };
    }

    if (!connectionRequests || connectionRequests.length === 0) {
      console.log("getConnections debug - No accepted connections found for user");
      return { connections: [] };
    }

    const uniqueConnections = new Map<string, Connection>();
    connectionRequests.forEach((request) => {
      // Determine which user is the "other" user (not the current user)
      const isUserSender = request.sender_id === user.id;
      const otherUserData = isUserSender ? request.receiver : request.sender;      console.log("getConnections debug - processing connection:", {
        isUserSender,
        hasOtherUserData: !!otherUserData
      });
      
      // Handle both array and object formats for the relationship data
      const otherUser = Array.isArray(otherUserData) ? otherUserData[0] : otherUserData;
      
      if (otherUser && !uniqueConnections.has(otherUser.user_id)) {
        uniqueConnections.set(otherUser.user_id, {
          user_id: otherUser.user_id,
          full_name: otherUser.full_name,
          email: otherUser.email,
          profile_image_url: otherUser.profile_image_url || null,
        });
      }
    });

    const finalConnections = Array.from(uniqueConnections.values());
    console.log("getConnections debug - final connections count:", finalConnections.length);
    
    return { connections: finalConnections };
  } catch (error) {
    console.error("Error in getConnections:", error);
    return { 
      connections: [], 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
