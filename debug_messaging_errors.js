const { createClient } = require("@supabase/supabase-js");

// Environment variables from .env.local
const supabaseUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugMessagingErrors() {
  console.log("🔍 DEBUGGING MESSAGING ERRORS");
  console.log("=".repeat(50));

  const connectionIds = [
    "69e781e4-e57d-4629-a44f-507b7c52f558",
    "615adc1b-15ae-4e5b-889e-6ed6bd0a567e",
  ];

  for (const connectionId of connectionIds) {
    console.log(`\n📋 Testing connection: ${connectionId}`);
    console.log("-".repeat(40));

    // Test 1: Check if connection exists
    console.log("1. Checking connection existence...");
    const { data: connection, error: connectionError } = await supabase
      .from("connection_requests")
      .select("*")
      .eq("connection_id", connectionId)
      .single();

    if (connectionError) {
      console.log("❌ Connection error:", connectionError);
      continue;
    } else {
      console.log("✅ Connection found:", {
        sender_id: connection.sender_id,
        receiver_id: connection.receiver_id,
        status: connection.status,
      });
    }

    // Test 2: Check messages query
    console.log("2. Testing messages query...");
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("message_id, sender_id, content, sent_at")
      .eq("connection_id", connectionId)
      .order("sent_at", { ascending: false })
      .limit(1);

    if (messagesError) {
      console.log("❌ Messages error:", messagesError);
      console.log("Error details:", JSON.stringify(messagesError, null, 2));
    } else {
      console.log("✅ Messages query successful:", messages);
    }

    // Test 3: Check all messages for this connection
    console.log("3. Checking all messages...");
    const { data: allMessages, error: allMessagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("connection_id", connectionId);

    if (allMessagesError) {
      console.log("❌ All messages error:", allMessagesError);
    } else {
      console.log(`✅ Found ${allMessages?.length || 0} total messages`);
      if (allMessages && allMessages.length > 0) {
        console.log("Sample message:", allMessages[0]);
      }
    }

    // Test 4: Check user info for connection
    console.log("4. Testing user relationships...");
    const { data: connectionWithUsers, error: usersError } = await supabase
      .from("connection_requests")
      .select(
        `
        sender_id,
        receiver_id,
        sender:users!connection_requests_sender_id_fkey(user_id, full_name, email),
        receiver:users!connection_requests_receiver_id_fkey(user_id, full_name, email)
      `
      )
      .eq("connection_id", connectionId)
      .single();

    if (usersError) {
      console.log("❌ Users relationship error:", usersError);
    } else {
      console.log("✅ Users relationship successful");
      console.log("Sender:", connectionWithUsers.sender);
      console.log("Receiver:", connectionWithUsers.receiver);
    }
  }
}

// Run the debug
debugMessagingErrors().catch(console.error);
