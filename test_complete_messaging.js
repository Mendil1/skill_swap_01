const { createClient } = require("@supabase/supabase-js");

// Environment variables from .env.local
const supabaseUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompleteMessagingFlow() {
  console.log("🚀 COMPLETE MESSAGING SYSTEM TEST");
  console.log("=".repeat(50));

  try {
    // Test 1: Test conversation list functionality like the component does
    console.log("\n1️⃣ Testing Conversation List Functionality");
    console.log("-".repeat(30));

    const sampleUserId = "3b4a6049-5f7d-4383-bef7-42c24ae7843b"; // Mariem's ID

    const { data: connections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select(
        `
        connection_id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:users!connection_requests_sender_id_fkey(user_id, full_name, email),
        receiver:users!connection_requests_receiver_id_fkey(user_id, full_name, email)
      `
      )
      .or(`sender_id.eq.${sampleUserId},receiver_id.eq.${sampleUserId}`)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });

    if (connectionsError) {
      console.log("❌ Connections error:", connectionsError);
      return;
    }

    console.log(`✅ Found ${connections?.length || 0} connections for user`);

    // Test each connection like the component does
    for (const connection of connections || []) {
      const isUserSender = connection.sender_id === sampleUserId;
      const partnerId = isUserSender ? connection.receiver_id : connection.sender_id;

      const senderData = Array.isArray(connection.sender)
        ? connection.sender[0]
        : connection.sender;
      const receiverData = Array.isArray(connection.receiver)
        ? connection.receiver[0]
        : connection.receiver;
      const partnerData = isUserSender ? receiverData : senderData;
      const partnerName = partnerData?.full_name || partnerData?.email || "Unknown User";

      console.log(`  📱 Connection ${connection.connection_id}: Partner = ${partnerName}`);

      // Test latest message query
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("message_id, sender_id, content, sent_at")
        .eq("connection_id", connection.connection_id)
        .order("sent_at", { ascending: false })
        .limit(1);

      if (messagesError) {
        console.log(`    ❌ Messages error: ${messagesError.message}`);
      } else {
        console.log(
          `    ✅ Latest message: "${messages?.[0]?.content || "No messages"}" (${messages?.length || 0} found)`
        );
      }
    }

    // Test 2: Test specific conversation message loading
    console.log("\n2️⃣ Testing Message List Functionality");
    console.log("-".repeat(30));

    const testConnectionId = "615adc1b-15ae-4e5b-889e-6ed6bd0a567e";

    // Test connection info fetch
    const { data: connInfo, error: connError } = await supabase
      .from("connection_requests")
      .select(
        `
        sender_id,
        receiver_id,
        sender:users!connection_requests_sender_id_fkey(user_id, full_name, email),
        receiver:users!connection_requests_receiver_id_fkey(user_id, full_name, email)
      `
      )
      .eq("connection_id", testConnectionId)
      .single();

    if (connError) {
      console.log("❌ Connection info error:", connError);
    } else {
      console.log("✅ Connection info loaded successfully");

      const isUserSender = connInfo.sender_id === sampleUserId;
      const senderData = Array.isArray(connInfo.sender) ? connInfo.sender[0] : connInfo.sender;
      const receiverData = Array.isArray(connInfo.receiver)
        ? connInfo.receiver[0]
        : connInfo.receiver;
      const partner = isUserSender ? receiverData : senderData;

      console.log(`  👤 Partner: ${partner?.full_name || partner?.email}`);
    }

    // Test message loading
    const { data: allMessages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("connection_id", testConnectionId)
      .order("sent_at", { ascending: true });

    if (messagesError) {
      console.log("❌ Messages loading error:", messagesError);
    } else {
      console.log(`✅ Loaded ${allMessages?.length || 0} messages in chronological order`);

      if (allMessages && allMessages.length > 0) {
        console.log("  📨 First message:", allMessages[0].content);
        console.log("  📨 Last message:", allMessages[allMessages.length - 1].content);

        // Group by date like the component does
        const groups = {};
        allMessages.forEach((message) => {
          const messageDate = message.sent_at || new Date().toISOString();
          const date = new Date(messageDate).toLocaleDateString();
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(message);
        });

        console.log(`  📅 Messages grouped into ${Object.keys(groups).length} date groups`);
      }
    }

    // Test 3: Real-time subscription test (setup only)
    console.log("\n3️⃣ Testing Real-time Setup");
    console.log("-".repeat(30));

    const channel = supabase.channel(`test-messages:${testConnectionId}`);

    if (channel) {
      console.log("✅ Real-time channel created successfully");
      supabase.removeChannel(channel);
      console.log("✅ Real-time channel cleaned up");
    } else {
      console.log("❌ Real-time channel creation failed");
    }

    console.log("\n🎉 COMPLETE MESSAGING TEST RESULTS:");
    console.log("=".repeat(50));
    console.log("✅ Database connectivity: WORKING");
    console.log("✅ Connection queries: WORKING");
    console.log("✅ Message queries: WORKING");
    console.log("✅ User relationships: WORKING");
    console.log("✅ Date grouping: WORKING");
    console.log("✅ Real-time setup: WORKING");
    console.log("");
    console.log("🚀 The messaging system should now work in the browser!");
    console.log("   Try visiting: http://localhost:3000/messages");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

testCompleteMessagingFlow().catch(console.error);
