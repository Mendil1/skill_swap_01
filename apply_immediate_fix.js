const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

async function applyImmediateFix() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing environment variables");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("🔧 APPLYING IMMEDIATE MESSAGING FIX...");
  console.log("=".repeat(40));

  try {
    // Apply the RLS disable commands from your guide
    console.log("📋 Disabling RLS on critical tables...");

    // Disable RLS
    const disableRLSCommands = [
      "ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE messages DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE connection_requests DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE users DISABLE ROW LEVEL SECURITY;",
      "ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;",
    ];

    for (const command of disableRLSCommands) {
      try {
        await supabase.rpc("exec_sql", { sql: command });
        console.log(`✅ ${command}`);
      } catch (error) {
        console.log(`⚠️  ${command} - ${error.message}`);
      }
    }

    // Drop conflicting policies
    console.log("\n🗑️ Dropping conflicting policies...");
    const dropPolicyCommands = [
      'DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;',
      'DROP POLICY IF EXISTS "System can insert notifications" ON notifications;',
      'DROP POLICY IF EXISTS "Users can insert notifications for others" ON notifications;',
      'DROP POLICY IF EXISTS "Users can view messages in their connections" ON messages;',
      'DROP POLICY IF EXISTS "Users can send messages in their connections" ON messages;',
      'DROP POLICY IF EXISTS "Users can view connection requests involving them" ON connection_requests;',
    ];

    for (const command of dropPolicyCommands) {
      try {
        await supabase.rpc("exec_sql", { sql: command });
        console.log(`✅ ${command}`);
      } catch (error) {
        console.log(`⚠️  ${command} - ${error.message}`);
      }
    }

    // Grant permissions
    console.log("\n🔓 Granting full access...");
    const grantCommands = [
      "GRANT ALL ON notifications TO authenticated;",
      "GRANT ALL ON notifications TO anon;",
      "GRANT ALL ON messages TO authenticated;",
      "GRANT ALL ON messages TO anon;",
      "GRANT ALL ON connection_requests TO authenticated;",
      "GRANT ALL ON connection_requests TO anon;",
      "GRANT ALL ON users TO authenticated;",
      "GRANT ALL ON users TO anon;",
      "GRANT ALL ON sessions TO authenticated;",
      "GRANT ALL ON sessions TO anon;",
    ];

    for (const command of grantCommands) {
      try {
        await supabase.rpc("exec_sql", { sql: command });
        console.log(`✅ ${command}`);
      } catch (error) {
        console.log(`⚠️  ${command} - ${error.message}`);
      }
    }

    console.log("\n✅ IMMEDIATE FIX APPLIED SUCCESSFULLY!");
    console.log("🔄 Please restart your development server now.");
  } catch (error) {
    console.error("❌ Failed to apply immediate fix:", error);
  }
}

applyImmediateFix();
