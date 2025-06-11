const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

async function comprehensiveMessagingDiagnosis() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing environment variables");
    console.log("Required:");
    console.log("- NEXT_PUBLIC_SUPABASE_URL");
    console.log("- SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("🔍 COMPREHENSIVE MESSAGING SYSTEM DIAGNOSIS");
  console.log("=".repeat(50));

  try {
    // 1. Check database tables structure
    console.log("\n📋 1. DATABASE STRUCTURE ANALYSIS");
    console.log("-".repeat(30));

    const { data: tableInfo, error: tableError } = await supabase.rpc("exec_sql", {
      sql: `
        SELECT
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name IN ('messages', 'connection_requests', 'users', 'notifications')
        ORDER BY table_name, ordinal_position;
      `,
    });

    if (tableError) {
      console.error("❌ Error checking table structure:", tableError);
    } else {
      console.log("✅ Database table structure:");
      console.table(tableInfo);
    }

    // 2. Check existing users
    console.log("\n👥 2. USERS ANALYSIS");
    console.log("-".repeat(30));

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (usersError) {
      console.error("❌ Error fetching users:", usersError);
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(
          `  ${index + 1}. ${user.full_name || user.email || user.user_id} (ID: ${user.user_id})`
        );
      });
    }

    // 3. Check connections
    console.log("\n🤝 3. CONNECTIONS ANALYSIS");
    console.log("-".repeat(30));

    const { data: connections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select(
        `
        connection_id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:users!connection_requests_sender_id_fkey(full_name, email),
        receiver:users!connection_requests_receiver_id_fkey(full_name, email)
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (connectionsError) {
      console.error("❌ Error fetching connections:", connectionsError);
    } else {
      console.log(`✅ Found ${connections.length} connections:`);
      connections.forEach((conn, index) => {
        const senderName = conn.sender?.full_name || conn.sender?.email || conn.sender_id;
        const receiverName = conn.receiver?.full_name || conn.receiver?.email || conn.receiver_id;
        console.log(
          `  ${index + 1}. ${senderName} → ${receiverName} (${conn.status}) [${conn.connection_id}]`
        );
      });
    }

    // 4. Check messages
    console.log("\n📨 4. MESSAGES ANALYSIS");
    console.log("-".repeat(30));

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(20);

    if (messagesError) {
      console.error("❌ Error fetching messages:", messagesError);
    } else {
      console.log(`✅ Found ${messages.length} messages:`);
      messages.forEach((msg, index) => {
        const preview =
          msg.content.length > 50 ? msg.content.substring(0, 50) + "..." : msg.content;
        console.log(
          `  ${index + 1}. [${msg.connection_id}] ${msg.sender_id}: "${preview}" (${msg.sent_at})`
        );
      });
    }

    // 5. Check for specific connection and its messages
    if (connections.length > 0) {
      const testConnection = connections[0];
      console.log(`\n🔍 5. DETAILED CONNECTION ANALYSIS: ${testConnection.connection_id}`);
      console.log("-".repeat(30));

      const { data: connectionMessages, error: connMsgError } = await supabase
        .from("messages")
        .select("*")
        .eq("connection_id", testConnection.connection_id)
        .order("sent_at", { ascending: true });

      if (connMsgError) {
        console.error("❌ Error fetching connection messages:", connMsgError);
      } else {
        console.log(
          `✅ Connection ${testConnection.connection_id} has ${connectionMessages.length} messages:`
        );
        connectionMessages.forEach((msg, index) => {
          console.log(`  ${index + 1}. ${msg.sender_id}: "${msg.content}" (${msg.sent_at})`);
        });
      }
    }

    // 6. Check RLS status
    console.log("\n🔐 6. ROW LEVEL SECURITY STATUS");
    console.log("-".repeat(30));

    const { data: rlsStatus, error: rlsError } = await supabase.rpc("exec_sql", {
      sql: `
        SELECT
          schemaname,
          tablename,
          rowsecurity as rls_enabled
        FROM pg_tables
        WHERE tablename IN ('messages', 'connection_requests', 'users', 'notifications')
        ORDER BY tablename;
      `,
    });

    if (rlsError) {
      console.error("❌ Error checking RLS status:", rlsError);
    } else {
      console.log("✅ RLS Status:");
      console.table(rlsStatus);
    }

    // 7. Test message query for a specific user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n🧪 7. USER MESSAGE ACCESS TEST: ${testUser.full_name || testUser.email}`);
      console.log("-".repeat(30));

      // Get user's connections
      const { data: userConnections, error: userConnError } = await supabase
        .from("connection_requests")
        .select("connection_id, sender_id, receiver_id, status")
        .or(`sender_id.eq.${testUser.user_id},receiver_id.eq.${testUser.user_id}`)
        .eq("status", "accepted");

      if (userConnError) {
        console.error("❌ Error fetching user connections:", userConnError);
      } else {
        console.log(`✅ User has ${userConnections.length} accepted connections`);

        for (const conn of userConnections) {
          const { data: connMessages, error: connMsgErr } = await supabase
            .from("messages")
            .select("*")
            .eq("connection_id", conn.connection_id)
            .order("sent_at", { ascending: false })
            .limit(5);

          if (connMsgErr) {
            console.error(
              `❌ Error fetching messages for connection ${conn.connection_id}:`,
              connMsgErr
            );
          } else {
            console.log(`  Connection ${conn.connection_id}: ${connMessages.length} messages`);
          }
        }
      }
    }

    // 8. Check for common issues
    console.log("\n⚠️  8. COMMON ISSUES CHECK");
    console.log("-".repeat(30));

    // Check for orphaned messages
    const { data: orphanedMessages, error: orphanError } = await supabase.rpc("exec_sql", {
      sql: `
        SELECT m.message_id, m.connection_id, m.content
        FROM messages m
        LEFT JOIN connection_requests cr ON m.connection_id = cr.connection_id
        WHERE cr.connection_id IS NULL
        LIMIT 10;
      `,
    });

    if (orphanError) {
      console.error("❌ Error checking orphaned messages:", orphanError);
    } else {
      if (orphanedMessages.length > 0) {
        console.log(
          `⚠️  Found ${orphanedMessages.length} orphaned messages (messages without connections)`
        );
        console.table(orphanedMessages);
      } else {
        console.log("✅ No orphaned messages found");
      }
    }

    // Check for duplicate connections
    const { data: duplicateConns, error: dupError } = await supabase.rpc("exec_sql", {
      sql: `
        SELECT sender_id, receiver_id, COUNT(*) as count
        FROM connection_requests
        GROUP BY sender_id, receiver_id
        HAVING COUNT(*) > 1
        LIMIT 10;
      `,
    });

    if (dupError) {
      console.error("❌ Error checking duplicate connections:", dupError);
    } else {
      if (duplicateConns.length > 0) {
        console.log(`⚠️  Found ${duplicateConns.length} duplicate connections`);
        console.table(duplicateConns);
      } else {
        console.log("✅ No duplicate connections found");
      }
    }

    console.log("\n✅ DIAGNOSIS COMPLETE");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Diagnosis failed with error:", error);
  }
}

// Run diagnosis
comprehensiveMessagingDiagnosis();
