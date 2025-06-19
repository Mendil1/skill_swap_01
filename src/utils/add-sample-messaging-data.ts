/**
 * Development utility to add sample messaging data
 * Run this script to populate the database with sample connections and messages
 * for testing the messaging system
 */

import { createClient } from "@/utils/supabase/client";

export async function addSampleMessagingData() {
  const supabase = createClient();

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log("❌ No authenticated user found. Please log in first.");
      return false;
    }

    console.log("🚀 Adding sample messaging data for user:", user.email);

    // 1. First, let's create some sample users if they don't exist
    const sampleUsers = [
      {
        user_id: "00000000-0000-0000-0000-000000000001",
        email: "alice.johnson@example.com",
        full_name: "Alice Johnson",
        bio: "Experienced JavaScript developer and React enthusiast. Love teaching and sharing knowledge!",
        hashed_password: "dummy_hash_1", // This is just for demo purposes
      },
      {
        user_id: "00000000-0000-0000-0000-000000000002",
        email: "bob.smith@example.com",
        full_name: "Bob Smith",
        bio: "Python backend developer with 5+ years experience. Always eager to learn new technologies.",
        hashed_password: "dummy_hash_2",
      },
      {
        user_id: "00000000-0000-0000-0000-000000000003",
        email: "carol.chen@example.com",
        full_name: "Carol Chen",
        bio: "UI/UX designer who loves creating beautiful and functional user experiences.",
        hashed_password: "dummy_hash_3",
      },
    ];

    // Insert sample users (ignore conflicts if they already exist)
    for (const sampleUser of sampleUsers) {
      const { error: insertError } = await supabase.from("users").upsert([sampleUser], {
        onConflict: "user_id",
        ignoreDuplicates: true,
      });

      if (insertError && !insertError.message.includes("duplicate")) {
        console.error("Error inserting sample user:", insertError);
      }
    }

    // 2. Create sample connections with current user
    const sampleConnections = [
      {
        connection_id: "10000000-0000-0000-0000-000000000001",
        sender_id: user.id,
        receiver_id: "00000000-0000-0000-0000-000000000001",
        status: "accepted",
      },
      {
        connection_id: "10000000-0000-0000-0000-000000000002",
        sender_id: "00000000-0000-0000-0000-000000000002",
        receiver_id: user.id,
        status: "accepted",
      },
      {
        connection_id: "10000000-0000-0000-0000-000000000003",
        sender_id: user.id,
        receiver_id: "00000000-0000-0000-0000-000000000003",
        status: "pending",
      },
    ];

    // Insert sample connections
    const { error: connectionsError } = await supabase
      .from("connection_requests")
      .upsert(sampleConnections, {
        onConflict: "connection_id",
        ignoreDuplicates: true,
      });

    if (connectionsError && !connectionsError.message.includes("duplicate")) {
      console.error("Error inserting connections:", connectionsError);
      return false;
    }

    // 3. Create sample messages
    const sampleMessages = [
      {
        connection_id: "10000000-0000-0000-0000-000000000001",
        sender_id: "00000000-0000-0000-0000-000000000001",
        content:
          "Hi! I saw you're offering JavaScript tutoring. I'm interested in learning React. Are you available for a session this week?",
        sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        connection_id: "10000000-0000-0000-0000-000000000001",
        sender_id: user.id,
        content:
          "Hi Alice! I'd be happy to help you with React. I have some time available this Thursday evening. What specific topics would you like to cover?",
        sent_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      },
      {
        connection_id: "10000000-0000-0000-0000-000000000001",
        sender_id: "00000000-0000-0000-0000-000000000001",
        content:
          "That sounds perfect! I'm particularly interested in hooks and state management. Thursday evening works great for me.",
        sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      },
      {
        connection_id: "10000000-0000-0000-0000-000000000002",
        sender_id: "00000000-0000-0000-0000-000000000002",
        content:
          "Thanks for the great Python session yesterday! The concepts you explained about data structures really clicked for me.",
        sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
      },
      {
        connection_id: "10000000-0000-0000-0000-000000000002",
        sender_id: user.id,
        content:
          "I'm so glad it was helpful! Feel free to reach out if you have any questions while practicing. Good luck with your projects!",
        sent_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), // 23 hours ago
      },
    ];

    // Insert sample messages
    const { error: messagesError } = await supabase.from("messages").insert(sampleMessages);

    if (messagesError && !messagesError.message.includes("duplicate")) {
      console.error("Error inserting messages:", messagesError);
      return false;
    }

    console.log("✅ Sample messaging data added successfully!");
    console.log("📊 Added:");
    console.log("   - 3 sample users");
    console.log("   - 3 connections (2 accepted, 1 pending)");
    console.log("   - 5 sample messages");
    console.log("🔄 Refresh the messages page to see the data!");

    return true;
  } catch (error) {
    console.error("❌ Error adding sample data:", error);
    return false;
  }
}

// Export for use in browser console
if (typeof window !== "undefined") {
  (
    window as unknown as { addSampleMessagingData: typeof addSampleMessagingData }
  ).addSampleMessagingData = addSampleMessagingData;
}
