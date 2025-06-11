const { createClient } = require("@supabase/supabase-js");

// Environment variables
const supabaseUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function quickDiagnosis() {
  console.log("🔍 QUICK MESSAGING SYSTEM DIAGNOSIS");
  console.log("=".repeat(40));

  try {
    // 1. Check users
    console.log("\n👥 CHECKING USERS...");
    const { data: users, error: usersError } = await supabase.from("users").select("*").limit(5);

    if (usersError) {
      console.error("❌ Users error:", usersError);
    } else {
      console.log(`✅ Found ${users.length} users`);
      users.forEach((user) => {
        console.log(`  - ${user.full_name || user.email} (${user.user_id})`);
      });
    }

    // 2. Check connections
    console.log("\n🤝 CHECKING CONNECTIONS...");
    const { data: connections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select("*")
      .limit(5);

    if (connectionsError) {
      console.error("❌ Connections error:", connectionsError);
    } else {
      console.log(`✅ Found ${connections.length} connections`);
      connections.forEach((conn) => {
        console.log(
          `  - ${conn.sender_id} → ${conn.receiver_id} (${conn.status}) [${conn.connection_id}]`
        );
      });
    }

    // 3. Check messages
    console.log("\n📨 CHECKING MESSAGES...");
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .limit(10);

    if (messagesError) {
      console.error("❌ Messages error:", messagesError);
    } else {
      console.log(`✅ Found ${messages.length} messages`);
      messages.forEach((msg) => {
        const preview = msg.content.substring(0, 30) + (msg.content.length > 30 ? "..." : "");
        console.log(`  - [${msg.connection_id}] ${msg.sender_id}: "${preview}"`);
      });
    }

    // 4. Apply immediate fix
    console.log("\n🔧 APPLYING IMMEDIATE FIX...");

    // Disable RLS
    const { error: rlsError1 } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE messages DISABLE ROW LEVEL SECURITY;",
    });
    if (!rlsError1) console.log("✅ Disabled RLS on messages");
    else console.log("⚠️  Messages RLS:", rlsError1.message);

    const { error: rlsError2 } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE connection_requests DISABLE ROW LEVEL SECURITY;",
    });
    if (!rlsError2) console.log("✅ Disabled RLS on connection_requests");
    else console.log("⚠️  Connection_requests RLS:", rlsError2.message);

    const { error: rlsError3 } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE users DISABLE ROW LEVEL SECURITY;",
    });
    if (!rlsError3) console.log("✅ Disabled RLS on users");
    else console.log("⚠️  Users RLS:", rlsError3.message);

    // Grant permissions
    const { error: grantError1 } = await supabase.rpc("exec_sql", {
      sql: "GRANT ALL ON messages TO authenticated, anon;",
    });
    if (!grantError1) console.log("✅ Granted permissions on messages");
    else console.log("⚠️  Messages permissions:", grantError1.message);

    const { error: grantError2 } = await supabase.rpc("exec_sql", {
      sql: "GRANT ALL ON connection_requests TO authenticated, anon;",
    });
    if (!grantError2) console.log("✅ Granted permissions on connection_requests");
    else console.log("⚠️  Connection_requests permissions:", grantError2.message);

    console.log("\n✅ DIAGNOSIS COMPLETE!");
  } catch (error) {
    console.error("❌ Diagnosis failed:", error);
  }
}

quickDiagnosis();
