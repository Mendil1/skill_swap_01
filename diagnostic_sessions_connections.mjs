#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://sogwgxkxuuvvvjbqlcdo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs"
);

async function diagnosticSessionsAndConnections() {
  console.log("🔍 DIAGNOSTIC: Sessions and Connections Issue");
  console.log("=".repeat(60));

  try {
    // 1. Check sessions table
    console.log("\n📅 1. SESSIONS TABLE");
    console.log("-".repeat(30));

    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .limit(10);

    if (sessionsError) {
      console.log("❌ Sessions error:", sessionsError.message);
    } else {
      console.log(`✅ Found ${sessions?.length || 0} sessions`);
      if (sessions && sessions.length > 0) {
        console.log("📋 Sample session:");
        console.log(`   ID: ${sessions[0].id}`);
        console.log(`   Organizer: ${sessions[0].organizer_id}`);
        console.log(`   Participant: ${sessions[0].participant_id}`);
        console.log(`   Scheduled: ${sessions[0].scheduled_at}`);
        console.log(`   Status: ${sessions[0].status}`);
      }
    }

    // 2. Check group sessions
    console.log("\n👥 2. GROUP SESSIONS TABLE");
    console.log("-".repeat(30));

    const { data: groupSessions, error: groupSessionsError } = await supabase
      .from("group_sessions")
      .select("*")
      .limit(10);

    if (groupSessionsError) {
      console.log("❌ Group sessions error:", groupSessionsError.message);
    } else {
      console.log(`✅ Found ${groupSessions?.length || 0} group sessions`);
      if (groupSessions && groupSessions.length > 0) {
        console.log("📋 Sample group session:");
        console.log(`   ID: ${groupSessions[0].id}`);
        console.log(`   Creator: ${groupSessions[0].creator_id}`);
        console.log(`   Topic: ${groupSessions[0].topic}`);
        console.log(`   Scheduled: ${groupSessions[0].scheduled_at}`);
        console.log(`   Status: ${groupSessions[0].status}`);
      }
    }

    // 3. Check connection requests
    console.log("\n🤝 3. CONNECTION REQUESTS TABLE");
    console.log("-".repeat(30));

    const { data: connections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select("*")
      .limit(10);

    if (connectionsError) {
      console.log("❌ Connections error:", connectionsError.message);
    } else {
      console.log(`✅ Found ${connections?.length || 0} connection requests`);

      if (connections && connections.length > 0) {
        const statusBreakdown = connections.reduce((acc, conn) => {
          acc[conn.status] = (acc[conn.status] || 0) + 1;
          return acc;
        }, {});

        console.log("📊 Status breakdown:", statusBreakdown);
        console.log("📋 Sample connection:");
        console.log(`   ID: ${connections[0].connection_id}`);
        console.log(`   Sender: ${connections[0].sender_id}`);
        console.log(`   Receiver: ${connections[0].receiver_id}`);
        console.log(`   Status: ${connections[0].status}`);
        console.log(`   Created: ${connections[0].created_at}`);
      }
    }

    // 4. Check users table
    console.log("\n👤 4. USERS TABLE");
    console.log("-".repeat(30));

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("user_id, full_name, email")
      .limit(10);

    if (usersError) {
      console.log("❌ Users error:", usersError.message);
    } else {
      console.log(`✅ Found ${users?.length || 0} users`);
      if (users && users.length > 0) {
        console.log("👥 Available users:");
        users.forEach((user, i) => {
          console.log(`   ${i + 1}. ${user.full_name} (${user.user_id})`);
        });
      }
    }

    // 5. Test specific user sessions and connections
    if (users && users.length > 0) {
      const testUser = users[0];
      console.log(`\n🧪 5. TESTING FOR USER: ${testUser.full_name}`);
      console.log("-".repeat(50));

      // Check user's sessions
      const { data: userSessions, error: userSessionsError } = await supabase
        .from("sessions")
        .select("*")
        .or(`organizer_id.eq.${testUser.user_id},participant_id.eq.${testUser.user_id}`);

      if (userSessionsError) {
        console.log("❌ User sessions error:", userSessionsError.message);
      } else {
        console.log(`📅 User has ${userSessions?.length || 0} one-on-one sessions`);
      }

      // Check user's group sessions
      const { data: userGroupSessions, error: userGroupSessionsError } = await supabase
        .from("group_sessions")
        .select("*")
        .eq("creator_id", testUser.user_id);

      if (userGroupSessionsError) {
        console.log("❌ User group sessions error:", userGroupSessionsError.message);
      } else {
        console.log(`👥 User created ${userGroupSessions?.length || 0} group sessions`);
      }

      // Check user's connections
      const { data: userConnections, error: userConnectionsError } = await supabase
        .from("connection_requests")
        .select(
          `
          *,
          sender:users!connection_requests_sender_id_fkey(user_id, full_name),
          receiver:users!connection_requests_receiver_id_fkey(user_id, full_name)
        `
        )
        .or(`sender_id.eq.${testUser.user_id},receiver_id.eq.${testUser.user_id}`)
        .eq("status", "accepted");

      if (userConnectionsError) {
        console.log("❌ User connections error:", userConnectionsError.message);
      } else {
        console.log(`🤝 User has ${userConnections?.length || 0} accepted connections`);
        if (userConnections && userConnections.length > 0) {
          userConnections.forEach((conn, i) => {
            const isUserSender = conn.sender_id === testUser.user_id;
            const otherUser = isUserSender ? conn.receiver : conn.sender;
            console.log(`   ${i + 1}. Connected to: ${otherUser?.full_name || "Unknown"}`);
          });
        }
      }
    }

    console.log("\n🎯 SUMMARY:");
    console.log("=".repeat(60));

    if (sessions && sessions.length === 0 && groupSessions && groupSessions.length === 0) {
      console.log("📅 NO SESSIONS FOUND - This explains why you see 0 sessions");
    }

    if (connections && connections.filter((c) => c.status === "accepted").length === 0) {
      console.log('🤝 NO ACCEPTED CONNECTIONS - This explains the "No connections found" message');
    }

    console.log("\n💡 RECOMMENDED NEXT STEPS:");
    if (!sessions || sessions.length === 0) {
      console.log("1. ✅ Create test sessions in the database");
    }
    if (!connections || connections.filter((c) => c.status === "accepted").length === 0) {
      console.log("2. ✅ Create test connections in the database");
    }
    console.log("3. ✅ Test the UI again after creating test data");
  } catch (error) {
    console.error("❌ Diagnostic error:", error);
  }
}

diagnosticSessionsAndConnections();
