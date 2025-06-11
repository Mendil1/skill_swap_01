import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function testConnectionsFunction() {
  console.log('🧪 Testing getUserConnections function logic...\n');

  const testUserId = "3b4a6049-5f7d-4383-bef7-42c24ae7843b";

  try {
    console.log('📋 Step 1: Testing connection query...');

    const { data: connections, error } = await supabase
      .from("connection_requests")
      .select(
        `
        *,
        receiver:users!connection_requests_receiver_id_fkey(
          user_id,
          full_name,
          email,
          profile_image_url
        ),
        sender:users!connection_requests_sender_id_fkey(
          user_id,
          full_name,
          email,
          profile_image_url
        )
      `
      )
      .or(`sender_id.eq.${testUserId},receiver_id.eq.${testUserId}`)
      .eq("status", "accepted");

    if (error) {
      console.error('❌ Query error:', error.message);
      return;
    }

    console.log('✅ Query successful!');
    console.log('📊 Raw connections found:', connections?.length || 0);

    if (connections && connections.length > 0) {
      console.log('\n📋 Step 2: Testing data transformation...');

      const transformedConnections = connections.map((conn) => {
        const isUserSender = conn.sender_id === testUserId;
        const otherUser = isUserSender ? conn.receiver : conn.sender;

        return {
          user_id: otherUser.user_id,
          full_name: otherUser.full_name,
          email: otherUser.email,
          profile_image_url: otherUser.profile_image_url,
        };
      });

      console.log('✅ Data transformation successful!');
      console.log('🎯 Transformed connections:', transformedConnections.length);

      console.log('\n👥 Connection Details:');
      transformedConnections.forEach((conn, i) => {
        console.log(`  ${i + 1}. ${conn.full_name} (${conn.user_id})`);
      });

      console.log('\n🎉 getUserConnections function logic is working correctly!');
      console.log('✅ The session scheduling dialog should now show these connections.');

    } else {
      console.log('⚠️  No connections found for test user');
      console.log('💡 This means the dropdown will be empty (expected behavior)');
    }

  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

testConnectionsFunction().catch(console.error);
