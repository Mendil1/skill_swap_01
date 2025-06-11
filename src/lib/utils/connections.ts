import { createClient } from "@/utils/supabase/client";
import { Connection } from "@/types/sessions";

// Helper function to get user's connections for session creation
export async function getUserConnections(): Promise<Connection[]> {
  const supabase = createClient();

  // Try to get session first, with retry mechanism
  console.log("getUserConnections debug - attempting to get user session...");
  
  let user = null;
  let authError = null;
  
  // First try to get the session (more reliable than getUser)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (session?.user) {
    user = session.user;
    console.log("getUserConnections debug - got user from session:", user.id);
  } else {
    console.log("getUserConnections debug - no session, trying getUser...");
    
    // Fallback to getUser with retry mechanism
    for (let attempt = 0; attempt < 3; attempt++) {
      const {
        data: { user: currentUser },
        error: currentAuthError,
      } = await supabase.auth.getUser();
      
      if (currentUser) {
        user = currentUser;
        authError = null;
        break;
      } else if (attempt < 2) {
        console.log(`getUserConnections debug - attempt ${attempt + 1} failed, retrying...`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        authError = currentAuthError;
      }
    }
  }
  
  console.log("getUserConnections debug - user:", user?.id || 'no user');
  console.log("getUserConnections debug - authError:", authError?.message || 'no error');
  
  if (authError || !user) {
    console.log("getUserConnections debug - no authenticated user, returning empty array");
    return [];
  }

  try {
    const { data: connections, error } = await supabase
      .from("connection_requests")
      .select(
        `
        *,
        receiver:users!connection_requests_receiver_id_fkey(
          user_id,
          full_name,
          email,
          profile_image_url
        ),
        sender:users!connection_requests_sender_id_fkey(
          user_id,
          full_name,
          email,
          profile_image_url
        )
      `
      )
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted");    console.log("getUserConnections debug - query error:", error?.message || 'no error');
    console.log("getUserConnections debug - connections found:", connections?.length || 0);
    console.log("getUserConnections debug - raw connections data:", connections);

    if (error) {
      console.error("Error fetching connections:", error);
      return [];
    }

    if (!connections || connections.length === 0) {
      console.log("getUserConnections debug - no connections found for user:", user.id);
      return [];
    }

    // Transform the data to normalize the connection format
    const transformedConnections = connections.map((conn) => {
      const isUserSender = conn.sender_id === user.id;
      const otherUser = isUserSender ? conn.receiver : conn.sender;
      
      console.log("getUserConnections debug - transforming connection:", {
        isUserSender,
        otherUser: otherUser ? {
          user_id: otherUser.user_id,
          full_name: otherUser.full_name
        } : 'null'
      });

      return {
        user_id: otherUser.user_id,
        full_name: otherUser.full_name,
        email: otherUser.email,
        profile_image_url: otherUser.profile_image_url,
      };
    });

    console.log("getUserConnections debug - final transformed connections:", transformedConnections);
    return transformedConnections;
  } catch (error) {
    console.error("Error in getUserConnections:", error);
    return [];
  }
}
