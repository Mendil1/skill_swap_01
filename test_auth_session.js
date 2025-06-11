// Test auth session in browser console
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://sogwgxkxuuvvvjbqlcdo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs"
);

async function testAuth() {
  console.log("🔐 Testing authentication...");

  // Test 1: Get session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  console.log("Session test:", { session: !!session, error: sessionError });

  if (session) {
    console.log("✅ Session exists:", session.user.id);
  } else {
    console.log("❌ No session found");
  }

  // Test 2: Get user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  console.log("User test:", { user: !!user, error: userError });

  if (user) {
    console.log("✅ User exists:", user.id);
  } else {
    console.log("❌ No user found");
  }

  // Test 3: Try to get some data
  const { data: messages, error: messageError } = await supabase
    .from("messages")
    .select("message_id")
    .limit(1);

  console.log("Data access test:", { count: messages?.length || 0, error: messageError });
}

testAuth();
