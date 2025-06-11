import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function simpleConnectionTest() {
  try {
    console.log('Testing connections query...');

    // Use the same test user from the messaging tests
    const testUserId = "3b4a6049-5f7d-4383-bef7-42c24ae7843b";

    const { data: connections, error } = await supabase
      .from("connection_requests")
      .select(`
        sender_id,
        receiver_id,
        status,
        sender:users!connection_requests_sender_id_fkey(user_id, full_name),
        receiver:users!connection_requests_receiver_id_fkey(user_id, full_name)
      `)
      .eq('status', 'accepted')
      .or(`sender_id.eq.${testUserId},receiver_id.eq.${testUserId}`);

    if (error) {
      console.log('Error:', error.message);
      return;
    }

    console.log('Found connections:', connections?.length || 0);

    if (connections && connections.length > 0) {
      connections.forEach((conn, i) => {
        const isUserSender = conn.sender_id === testUserId;
        const otherUser = isUserSender ? conn.receiver : conn.sender;
        const otherUserData = Array.isArray(otherUser) ? otherUser[0] : otherUser;

        console.log(`Connection ${i + 1}:`, {
          isUserSender,
          otherUserName: otherUserData?.full_name || 'Unknown',
          otherUserId: isUserSender ? conn.receiver_id : conn.sender_id
        });
      });
    }

  } catch (error) {
    console.log('Exception:', error.message);
  }
}

simpleConnectionTest();
