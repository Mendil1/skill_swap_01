import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { connectionId, content } = await request.json();

    if (!connectionId || !content) {
      return NextResponse.json(
        { error: "Missing required fields: connectionId and content" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[MessageAPI] Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[MessageAPI] Sending message from user:", user.id, "to connection:", connectionId);

    // Verify that the user is part of this connection
    const { data: connection, error: connectionError } = await supabase
      .from("connection_requests")
      .select("*")
      .eq("connection_id", connectionId)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted")
      .single();

    if (connectionError || !connection) {
      console.warn("[MessageAPI] Connection not found or unauthorized:", connectionError);
      return NextResponse.json(
        { error: "Connection not found or unauthorized" },
        { status: 403 }
      );
    }

    // Insert the new message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        connection_id: connectionId,
        sender_id: user.id,
        content: content.trim(),
        sent_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (messageError) {
      console.error("[MessageAPI] Error inserting message:", messageError);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    console.log("[MessageAPI] Message sent successfully:", message.message_id);

    return NextResponse.json({
      success: true,
      message: {
        id: message.message_id,
        content: message.content,
        timestamp: message.sent_at,
        senderId: message.sender_id,
        connectionId: message.connection_id,
      },
    });

  } catch (error) {
    console.error("[MessageAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const connectionId = url.searchParams.get("connectionId");

    if (!connectionId) {
      return NextResponse.json(
        { error: "Missing connectionId parameter" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify that the user is part of this connection
    const { data: connection, error: connectionError } = await supabase
      .from("connection_requests")
      .select("*")
      .eq("connection_id", connectionId)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted")
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: "Connection not found or unauthorized" },
        { status: 403 }
      );
    }

    // Get messages for this connection
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(`
        message_id,
        content,
        sent_at,
        sender_id,
        connection_id
      `)
      .eq("connection_id", connectionId)
      .order("sent_at", { ascending: true });

    if (messagesError) {
      console.error("[MessageAPI] Error fetching messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    // Get sender details for all messages
    const senderIds = [...new Set(messages?.map((msg) => msg.sender_id) || [])];
    const { data: senders, error: sendersError } = await supabase
      .from("users")
      .select("user_id, full_name, email, profile_image_url")
      .in("user_id", senderIds);

    if (sendersError) {
      console.warn("[MessageAPI] Error fetching senders:", sendersError);
    }

    // Transform messages with sender details
    const sendersMap = new Map(senders?.map((sender) => [sender.user_id, sender]) || []);
    const transformedMessages = messages?.map((msg) => {
      const sender = sendersMap.get(msg.sender_id);
      return {
        id: msg.message_id,
        content: msg.content,
        timestamp: msg.sent_at,
        senderId: msg.sender_id,
        connectionId: msg.connection_id,
        sender: {
          id: msg.sender_id,
          name: sender?.full_name || sender?.email || "Unknown User",
          avatar: sender?.profile_image_url || null,
        },
      };
    }) || [];

    return NextResponse.json({
      success: true,
      messages: transformedMessages,
    });

  } catch (error) {
    console.error("[MessageAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
