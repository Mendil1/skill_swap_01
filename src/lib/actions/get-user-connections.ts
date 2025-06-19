"use server";

import { createClient } from "@/utils/supabase/server";
import { Connection } from "@/types/sessions";

export async function getUserConnectionsServer(): Promise<Connection[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("getUserConnectionsServer debug - user:", user?.id || "no user");
  console.log("getUserConnectionsServer debug - authError:", authError?.message || "no error");

  if (authError || !user) {
    console.log("getUserConnectionsServer debug - no authenticated user, returning empty array");
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
      .eq("status", "accepted");

    console.log("getUserConnectionsServer debug - query error:", error?.message || "no error");
    console.log("getUserConnectionsServer debug - connections found:", connections?.length || 0);
    console.log("getUserConnectionsServer debug - raw connections data:", connections);

    if (error) {
      console.error("Error fetching connections:", error);
      return [];
    }

    if (!connections || connections.length === 0) {
      console.log("getUserConnectionsServer debug - no connections found for user:", user.id);
      return [];
    }

    // Transform the data to normalize the connection format
    const transformedConnections = connections.map((conn) => {
      const isUserSender = conn.sender_id === user.id;
      const otherUser = isUserSender ? conn.receiver : conn.sender;

      console.log("getUserConnectionsServer debug - transforming connection:", {
        isUserSender,
        otherUser: otherUser
          ? {
              user_id: otherUser.user_id,
              full_name: otherUser.full_name,
            }
          : "null",
      });

      return {
        user_id: otherUser.user_id,
        full_name: otherUser.full_name,
        email: otherUser.email,
        profile_image_url: otherUser.profile_image_url,
      };
    });

    console.log(
      "getUserConnectionsServer debug - final transformed connections:",
      transformedConnections
    );
    return transformedConnections;
  } catch (error) {
    console.error("Error in getUserConnectionsServer:", error);
    return [];
  }
}
