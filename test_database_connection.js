const { createClient } = require("@supabase/supabase-js");

// Environment variables from .env.local
const supabaseUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  console.log("🔍 TESTING DATABASE CONNECTION AND PERMISSIONS");
  console.log("=".repeat(60));

  try {
    // Test 1: Check if we can read users table
    console.log("\n📊 Test 1: Reading users table...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("user_id, email, full_name")
      .limit(5);

    if (usersError) {
      console.log("❌ Users table error:", usersError.message);
    } else {
      console.log(`✅ Users table accessible - Found ${users?.length || 0} users`);
      if (users && users.length > 0) {
        console.log("   Sample user:", users[0]);
      }
    }

    // Test 2: Check if we can read connection_requests table
    console.log("\n📊 Test 2: Reading connection_requests table...");
    const { data: connections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select("connection_id, sender_id, receiver_id, status")
      .limit(5);

    if (connectionsError) {
      console.log("❌ Connection requests table error:", connectionsError.message);
    } else {
      console.log(
        `✅ Connection requests table accessible - Found ${connections?.length || 0} connections`
      );
      if (connections && connections.length > 0) {
        console.log("   Sample connection:", connections[0]);
      }
    }

    // Test 3: Check if we can read messages table
    console.log("\n📊 Test 3: Reading messages table...");
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("message_id, connection_id, sender_id, content, sent_at")
      .order("sent_at", { ascending: false })
      .limit(10);

    if (messagesError) {
      console.log("❌ Messages table error:", messagesError.message);
    } else {
      console.log(`✅ Messages table accessible - Found ${messages?.length || 0} messages`);
      if (messages && messages.length > 0) {
        console.log("   Sample messages:");
        messages.slice(0, 3).forEach((msg, idx) => {
          console.log(`   ${idx + 1}. "${msg.content?.substring(0, 50)}..." (${msg.sent_at})`);
        });
      }
    }

    // Test 4: Test message fetching with relationships (like our component would do)
    console.log("\n📊 Test 4: Testing message fetching with relationships...");

    if (connections && connections.length > 0) {
      const sampleConnectionId = connections[0].connection_id;
      console.log(`   Testing with connection ID: ${sampleConnectionId}`);

      const { data: connectionMessages, error: connectionMessagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("connection_id", sampleConnectionId)
        .order("sent_at", { ascending: true });

      if (connectionMessagesError) {
        console.log("❌ Connection messages error:", connectionMessagesError.message);
      } else {
        console.log(
          `✅ Connection messages accessible - Found ${connectionMessages?.length || 0} messages for this conversation`
        );
      }
    }

    // Test 5: Test conversation list query (like our component would do)
    console.log("\n📊 Test 5: Testing conversation list query...");

    if (users && users.length > 0) {
      const sampleUserId = users[0].user_id;
      console.log(`   Testing with user ID: ${sampleUserId}`);

      const { data: userConnections, error: userConnectionsError } = await supabase
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
        .eq("status", "accepted");

      if (userConnectionsError) {
        console.log("❌ User connections error:", userConnectionsError.message);
      } else {
        console.log(
          `✅ User connections query successful - Found ${userConnections?.length || 0} accepted connections`
        );
        if (userConnections && userConnections.length > 0) {
          console.log("   Sample connection with user data:", userConnections[0]);
        }
      }
    }

    console.log("\n🎉 DATABASE CONNECTION TEST COMPLETED");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Unexpected error during testing:", error);
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
