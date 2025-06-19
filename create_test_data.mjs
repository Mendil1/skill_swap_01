#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://sogwgxkxuuvvvjbqlcdo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs"
);

async function createTestData() {
  console.log("🔧 CREATING TEST DATA: Sessions and Connections");
  console.log("=".repeat(60));

  try {
    // Get available users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("user_id, full_name, email")
      .limit(5);

    if (usersError || !users || users.length < 2) {
      console.log("❌ Need at least 2 users to create test data");
      return;
    }

    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.full_name} (${user.user_id})`);
    });

    const [user1, user2, user3] = users;

    // 1. Create test connections
    console.log("\n🤝 1. CREATING TEST CONNECTIONS");
    console.log("-".repeat(40));

    const testConnections = [
      {
        sender_id: user1.user_id,
        receiver_id: user2.user_id,
        status: "accepted",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    if (user3) {
      testConnections.push({
        sender_id: user1.user_id,
        receiver_id: user3.user_id,
        status: "accepted",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const { data: newConnections, error: connectionsError } = await supabase
      .from("connection_requests")
      .insert(testConnections)
      .select();

    if (connectionsError) {
      console.log("❌ Error creating connections:", connectionsError.message);
    } else {
      console.log(`✅ Created ${newConnections?.length || 0} test connections`);
      newConnections?.forEach((conn, i) => {
        console.log(`   ${i + 1}. ${conn.sender_id} ↔ ${conn.receiver_id}`);
      });
    }

    // 2. Create test one-on-one sessions
    console.log("\n📅 2. CREATING TEST ONE-ON-ONE SESSIONS");
    console.log("-".repeat(40));

    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const futureDate2 = new Date(now.getTime() + 48 * 60 * 60 * 1000); // Day after tomorrow
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday

    const testSessions = [
      {
        organizer_id: user1.user_id,
        participant_id: user2.user_id,
        scheduled_at: futureDate1.toISOString(),
        duration_minutes: 60,
        status: "upcoming",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        organizer_id: user2.user_id,
        participant_id: user1.user_id,
        scheduled_at: futureDate2.toISOString(),
        duration_minutes: 90,
        status: "upcoming",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        organizer_id: user1.user_id,
        participant_id: user2.user_id,
        scheduled_at: pastDate.toISOString(),
        duration_minutes: 60,
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const { data: newSessions, error: sessionsError } = await supabase
      .from("sessions")
      .insert(testSessions)
      .select();

    if (sessionsError) {
      console.log("❌ Error creating sessions:", sessionsError.message);
    } else {
      console.log(`✅ Created ${newSessions?.length || 0} test sessions`);
      newSessions?.forEach((session, i) => {
        console.log(
          `   ${i + 1}. ${session.organizer_id} → ${session.participant_id} (${session.status})`
        );
        console.log(`      Scheduled: ${new Date(session.scheduled_at).toLocaleString()}`);
      });
    }

    // 3. Create test group sessions
    console.log("\n👥 3. CREATING TEST GROUP SESSIONS");
    console.log("-".repeat(40));

    const testGroupSessions = [
      {
        creator_id: user1.user_id,
        topic: "JavaScript Study Group",
        scheduled_at: futureDate1.toISOString(),
        duration_minutes: 120,
        status: "upcoming",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        creator_id: user2.user_id,
        topic: "React Best Practices",
        scheduled_at: futureDate2.toISOString(),
        duration_minutes: 90,
        status: "upcoming",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const { data: newGroupSessions, error: groupSessionsError } = await supabase
      .from("group_sessions")
      .insert(testGroupSessions)
      .select();

    if (groupSessionsError) {
      console.log("❌ Error creating group sessions:", groupSessionsError.message);
    } else {
      console.log(`✅ Created ${newGroupSessions?.length || 0} test group sessions`);
      newGroupSessions?.forEach((session, i) => {
        console.log(`   ${i + 1}. ${session.topic} by ${session.creator_id}`);
        console.log(`      Scheduled: ${new Date(session.scheduled_at).toLocaleString()}`);
      });

      // 4. Add participants to group sessions
      if (newGroupSessions && newGroupSessions.length > 0) {
        console.log("\n👤 4. ADDING GROUP SESSION PARTICIPANTS");
        console.log("-".repeat(40));

        const participants = [];

        // Add user2 to user1's group session
        if (newGroupSessions[0]) {
          participants.push({
            group_session_id: newGroupSessions[0].id,
            user_id: user2.user_id,
            joined_at: new Date().toISOString(),
          });

          if (user3) {
            participants.push({
              group_session_id: newGroupSessions[0].id,
              user_id: user3.user_id,
              joined_at: new Date().toISOString(),
            });
          }
        }

        // Add user1 to user2's group session
        if (newGroupSessions[1]) {
          participants.push({
            group_session_id: newGroupSessions[1].id,
            user_id: user1.user_id,
            joined_at: new Date().toISOString(),
          });
        }

        const { data: newParticipants, error: participantsError } = await supabase
          .from("group_session_participants")
          .insert(participants)
          .select();

        if (participantsError) {
          console.log("❌ Error adding participants:", participantsError.message);
        } else {
          console.log(`✅ Added ${newParticipants?.length || 0} group session participants`);
        }
      }
    }

    console.log("\n🎉 TEST DATA CREATION COMPLETE!");
    console.log("=".repeat(60));
    console.log("✅ You should now see sessions and connections in the UI");
    console.log("🔄 Try refreshing your browser and navigating to:");
    console.log("   📅 /sessions - Should show your sessions");
    console.log("   🤝 /messages - Should show your connections");
    console.log("   ➕ Create Session button - Should show available connections");
  } catch (error) {
    console.error("❌ Error creating test data:", error);
  }
}

createTestData();
