const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://sogwgxkxuuvvvjbqlcdo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs"
);

async function testAuthAndSessions() {
  console.log("🔍 Testing Authentication & Session Filtering");
  console.log("=".repeat(50));

  try {
    // Check authentication status
    console.log("\n1. Authentication Status:");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("❌ No authenticated user found");
      console.log("   Error:", authError?.message || "No user session");
      console.log("   This explains why sessions page shows 0 sessions!");
      console.log("\n🔧 Solution: You need to log in to see your sessions");
      return;
    }

    console.log("✅ User authenticated:", user.id);
    console.log("   Email:", user.email);

    // Check if this user has any sessions
    console.log("\n2. Sessions for current user:");
    const { data: userSessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .or(`organizer_id.eq.${user.id},participant_id.eq.${user.id}`);

    console.log(`📅 User's sessions: ${userSessions?.length || 0} found`);
    if (sessionsError) console.log("   Error:", sessionsError.message);

    // Check user's connections
    console.log("\n3. Connections for current user:");
    const { data: userConnections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted");

    console.log(`🔗 User's connections: ${userConnections?.length || 0} found`);
    if (connectionsError) console.log("   Error:", connectionsError.message);

    // Show all sessions and their owners
    console.log("\n4. All sessions in database:");
    const { data: allSessions } = await supabase
      .from("sessions")
      .select("id, organizer_id, participant_id, status");

    if (allSessions && allSessions.length > 0) {
      console.log("📋 Session ownership:");
      allSessions.forEach((session, i) => {
        const isOwner = session.organizer_id === user.id || session.participant_id === user.id;
        console.log(
          `   ${i + 1}. ${session.id.slice(-8)} - Organizer: ${session.organizer_id.slice(-8)} | Participant: ${session.participant_id.slice(-8)} ${isOwner ? "👤 (Your session)" : ""}`
        );
      });
    }

    // Check all connections
    console.log("\n5. All connections in database:");
    const { data: allConnections } = await supabase
      .from("connection_requests")
      .select("connection_id, sender_id, receiver_id, status");

    if (allConnections && allConnections.length > 0) {
      console.log("📋 Connection ownership:");
      allConnections.forEach((conn, i) => {
        const isYours = conn.sender_id === user.id || conn.receiver_id === user.id;
        console.log(
          `   ${i + 1}. ${conn.connection_id.slice(-8)} - ${conn.sender_id.slice(-8)} → ${conn.receiver_id.slice(-8)} (${conn.status}) ${isYours ? "👤 (Your connection)" : ""}`
        );
      });
    }

    // Recommend next steps
    console.log("\n📝 Next Steps:");
    if (userSessions?.length === 0) {
      console.log("   • Your account has no sessions scheduled");
      console.log("   • Try creating a session with one of your connections");
    }
    if (userConnections?.length === 0) {
      console.log("   • Your account has no accepted connections");
      console.log("   • Go to Browse page to connect with other users first");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAuthAndSessions();
