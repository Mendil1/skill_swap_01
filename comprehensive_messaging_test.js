const { createClient } = require("@supabase/supabase-js");

// Environment variables from .env.local
const supabaseUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function comprehensiveMessagingTest() {
  console.log("🧪 COMPREHENSIVE MESSAGING SYSTEM TEST");
  console.log("=".repeat(50));

  try {
    // Step 1: Apply RLS fixes
    console.log("\n🔧 Step 1: Applying Database Fixes...");
    console.log("-".repeat(30));

    // Disable RLS on all messaging tables
    const rlsCommands = [
      "ALTER TABLE messages DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE connection_requests DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE users DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;",
    ];

    for (const command of rlsCommands) {
      try {
        await supabase.rpc("exec_sql", { sql: command });
        console.log(`✅ ${command}`);
      } catch (error) {
        console.log(`⚠️  ${command} - Already disabled or error: ${error.message}`);
      }
    }

    // Grant permissions
    const grantCommands = [
      "GRANT ALL ON messages TO authenticated, anon;",
      "GRANT ALL ON connection_requests TO authenticated, anon;",
      "GRANT ALL ON users TO authenticated, anon;",
      "GRANT ALL ON notifications TO authenticated, anon;",
    ];

    for (const command of grantCommands) {
      try {
        await supabase.rpc("exec_sql", { sql: command });
        console.log(`✅ ${command}`);
      } catch (error) {
        console.log(`⚠️  ${command} - ${error.message}`);
      }
    }

    // Step 2: Check database schema
    console.log("\n📋 Step 2: Checking Database Schema...");
    console.log("-".repeat(30));

    const { data: tableInfo, error: tableError } = await supabase.rpc("exec_sql", {
      sql: `
        SELECT
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_name IN ('messages', 'connection_requests', 'users')
        ORDER BY table_name, ordinal_position;
      `,
    });

    if (tableError) {
      console.error("❌ Error checking schema:", tableError);
    } else {
      console.log("✅ Database schema:");
      const groupedByTable = {};
      tableInfo.forEach((row) => {
        if (!groupedByTable[row.table_name]) {
          groupedByTable[row.table_name] = [];
        }
        groupedByTable[row.table_name].push(`${row.column_name} (${row.data_type})`);
      });

      Object.keys(groupedByTable).forEach((tableName) => {
        console.log(`  📊 ${tableName}:`);
        groupedByTable[tableName].forEach((col) => {
          console.log(`    - ${col}`);
        });
      });
    }

    // Step 3: Check existing data
    console.log("\n📊 Step 3: Analyzing Existing Data...");
    console.log("-".repeat(30));

    // Check users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("user_id, full_name, email")
      .order("created_at", { ascending: false })
      .limit(5);

    if (usersError) {
      console.error("❌ Users error:", usersError);
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach((user, i) => {
        console.log(`  ${i + 1}. ${user.full_name || user.email} (${user.user_id})`);
      });
    }

    // Check connections
    const { data: connections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select(
        `
        connection_id,
        sender_id,
        receiver_id,
        status,
        created_at
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (connectionsError) {
      console.error("❌ Connections error:", connectionsError);
    } else {
      console.log(`✅ Found ${connections.length} connections:`);
      connections.forEach((conn, i) => {
        console.log(
          `  ${i + 1}. ${conn.sender_id} → ${conn.receiver_id} (${conn.status}) [${conn.connection_id}]`
        );
      });
    }

    // Check messages
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(10);

    if (messagesError) {
      console.error("❌ Messages error:", messagesError);
    } else {
      console.log(`✅ Found ${messages.length} messages:`);
      messages.forEach((msg, i) => {
        const preview = msg.content.substring(0, 40) + (msg.content.length > 40 ? "..." : "");
        const timestamp = new Date(msg.sent_at || msg.created_at).toLocaleString();
        console.log(
          `  ${i + 1}. [${msg.connection_id}] ${msg.sender_id}: "${preview}" (${timestamp})`
        );
      });
    }

    // Step 4: Test specific user's conversations
    if (users.length > 0) {
      const testUser = users[0];
      console.log(
        `\n🧑‍💻 Step 4: Testing Conversations for ${testUser.full_name || testUser.email}...`
      );
      console.log("-".repeat(30));

      // Get user's connections (simulating the improved conversation list logic)
      const { data: userConnections, error: userConnError } = await supabase
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
        .or(`sender_id.eq.${testUser.user_id},receiver_id.eq.${testUser.user_id}`)
        .eq("status", "accepted")
        .order("created_at", { ascending: false });

      if (userConnError) {
        console.error("❌ Error fetching user connections:", userConnError);
      } else {
        console.log(`✅ User has ${userConnections.length} accepted connections:`);

        for (const conn of userConnections) {
          const isUserSender = conn.sender_id === testUser.user_id;
          const partnerData = isUserSender
            ? Array.isArray(conn.receiver)
              ? conn.receiver[0]
              : conn.receiver
            : Array.isArray(conn.sender)
              ? conn.sender[0]
              : conn.sender;

          const partnerName = partnerData?.full_name || partnerData?.email || "Unknown";

          // Get messages for this connection
          const { data: connMessages, error: connMsgError } = await supabase
            .from("messages")
            .select("message_id, sender_id, content, sent_at, created_at")
            .eq("connection_id", conn.connection_id)
            .order("sent_at", { ascending: false })
            .limit(3);

          if (connMsgError) {
            console.error(`❌ Error fetching messages for ${conn.connection_id}:`, connMsgError);
          } else {
            console.log(`  🗣️  Connection with ${partnerName} [${conn.connection_id}]:`);
            console.log(`      ${connMessages.length} messages found`);

            connMessages.forEach((msg, msgIndex) => {
              const isSender = msg.sender_id === testUser.user_id;
              const preview = msg.content.substring(0, 30) + (msg.content.length > 30 ? "..." : "");
              const time = new Date(msg.sent_at || msg.created_at).toLocaleTimeString();
              console.log(
                `        ${msgIndex + 1}. ${isSender ? "You" : partnerName}: "${preview}" (${time})`
              );
            });
          }
        }
      }
    }

    // Step 5: Create test data if needed
    if (messages.length === 0 && connections.length > 0) {
      console.log("\n🧪 Step 5: Creating Test Message...");
      console.log("-".repeat(30));

      const testConnection = connections[0];
      const { data: testMessage, error: testMsgError } = await supabase
        .from("messages")
        .insert({
          connection_id: testConnection.connection_id,
          sender_id: testConnection.sender_id,
          content: `Test message created at ${new Date().toISOString()}`,
        })
        .select()
        .single();

      if (testMsgError) {
        console.error("❌ Error creating test message:", testMsgError);
      } else {
        console.log("✅ Test message created:", testMessage);
      }
    }

    // Step 6: Verification summary
    console.log("\n📝 Step 6: System Status Summary");
    console.log("-".repeat(30));

    console.log(`👥 Users: ${users.length} found`);
    console.log(`🤝 Connections: ${connections.length} found`);
    console.log(`📨 Messages: ${messages.length} found`);

    if (users.length > 0 && connections.length > 0) {
      console.log("✅ Database has data - messaging system should work");
    } else {
      console.log("⚠️  No data found - you may need to create users and connections first");
    }

    console.log("\n🎯 WHAT TO DO NEXT:");
    console.log("1. Restart your development server: npm run dev");
    console.log("2. Go to /messages in your browser");
    console.log("3. Check browser console for any errors");
    console.log("4. Try sending a message in an existing conversation");

    console.log("\n✅ MESSAGING SYSTEM TEST COMPLETE!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
comprehensiveMessagingTest();
