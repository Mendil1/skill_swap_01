const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://sogwgxkxuuvvvjbqlcdo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs"
);

async function quickCheck() {
  console.log("🔍 Quick Database Check");
  console.log("=".repeat(30));

  try {
    // Check sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .limit(5);

    console.log(`📅 Sessions: ${sessions?.length || 0} found`);
    if (sessionsError) console.log(`   Error: ${sessionsError.message}`);
    if (sessions && sessions.length > 0) {
      console.log(`   Sample columns: ${Object.keys(sessions[0]).join(", ")}`);
    }

    // Check connection_requests (correct table name)
    const { data: connections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select("*")
      .eq("status", "accepted")
      .limit(5);

    console.log(`🔗 Accepted Connections: ${connections?.length || 0} found`);
    if (connectionsError) console.log(`   Error: ${connectionsError.message}`);
    if (connections && connections.length > 0) {
      console.log(`   Sample columns: ${Object.keys(connections[0]).join(", ")}`);
    }

    // Check users (using correct column names)
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("user_id, full_name, email")
      .limit(3);

    console.log(`👤 Users: ${users?.length || 0} found`);
    if (usersError) console.log(`   Error: ${usersError.message}`);

    if (users && users.length > 0) {
      console.log("\n📋 Sample user IDs:");
      users.forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.user_id} - ${user.full_name || user.email}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

quickCheck();
