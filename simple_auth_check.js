const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://sogwgxkxuuvvvjbqlcdo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs"
);

async function checkAuth() {
  console.log("🔍 Auth & Sessions Check");
  console.log("=".repeat(30));

  // Check auth status
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.log("❌ Not authenticated - this is why sessions page shows 0!");
    console.log("💡 Solution: Log in first");
    process.exit(0);
  }

  console.log("✅ Authenticated as:", user.email);

  // Check user's sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .or(`organizer_id.eq.${user.id},participant_id.eq.${user.id}`);

  console.log(`📅 Your sessions: ${sessions?.length || 0}`);

  // Check user's connections
  const { data: connections } = await supabase
    .from("connection_requests")
    .select("*")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq("status", "accepted");

  console.log(`🔗 Your connections: ${connections?.length || 0}`);

  if (sessions?.length === 0 && connections?.length === 0) {
    console.log('\n💡 To fix "0 sessions" and "No connections":');
    console.log("1. Connect with other users first");
    console.log("2. Create sessions with your connections");
  }
}

checkAuth().catch(console.error);
