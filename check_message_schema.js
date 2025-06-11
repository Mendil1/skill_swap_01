const { createClient } = require("@supabase/supabase-js");

// Environment variables from .env.local
const supabaseUrl = "https://sogwgxkxuuvvvjbqlcdo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMessageSchema() {
  console.log("🔍 CHECKING MESSAGE TABLE SCHEMA");
  console.log("=".repeat(40));

  // Get a sample message to see actual schema
  const { data: messages, error } = await supabase.from("messages").select("*").limit(1);

  if (error) {
    console.log("❌ Error:", error);
  } else if (messages && messages.length > 0) {
    console.log("✅ Message table columns:");
    Object.keys(messages[0]).forEach((key) => {
      console.log(`  - ${key}: ${typeof messages[0][key]}`);
    });

    console.log("\n📋 Sample message structure:");
    console.log(JSON.stringify(messages[0], null, 2));
  } else {
    console.log("❌ No messages found");
  }

  // Test if is_read column exists
  console.log("\n🔍 Testing is_read column...");
  const { data: readTest, error: readError } = await supabase
    .from("messages")
    .select("message_id, is_read")
    .limit(1);

  if (readError) {
    console.log("❌ is_read column error:", readError.message);
  } else {
    console.log("✅ is_read column exists");
  }
}

checkMessageSchema().catch(console.error);
