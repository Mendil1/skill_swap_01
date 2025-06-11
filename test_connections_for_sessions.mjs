// Test the fixed getConnections function
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function testConnectionsFetching() {
  console.log('🧪 Testing connections fetching for session scheduling...\n');

  try {
    // Test the connection_requests query directly
    console.log('1. Testing connection_requests table access...');

    const { data: allConnections, error: allError } = await supabase
      .from('connection_requests')
      .select('*')
      .limit(5);

    if (allError) {
      console.log('❌ Error accessing connection_requests:', allError.message);
      return;
    }

    console.log('✅ Connection requests table accessible');
    console.log('📊 Total connection requests found:', allConnections?.length || 0);

    if (allConnections && allConnections.length > 0) {
      console.log('📋 Sample connection request:', allConnections[0]);

      // Show status breakdown
      const statusBreakdown = allConnections.reduce((acc, conn) => {
        acc[conn.status] = (acc[conn.status] || 0) + 1;
        return acc;
      }, {});
      console.log('📈 Status breakdown:', statusBreakdown);
    }

    // Test accepted connections specifically
    console.log('\n2. Testing accepted connections...');

    const { data: acceptedConnections, error: acceptedError } = await supabase
      .from('connection_requests')
      .select(`
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:users!connection_requests_sender_id_fkey(user_id, full_name, email, profile_image_url),
        receiver:users!connection_requests_receiver_id_fkey(user_id, full_name, email, profile_image_url)
      `)
      .eq('status', 'accepted');

    if (acceptedError) {
      console.log('❌ Error fetching accepted connections:', acceptedError.message);
    } else {
      console.log('✅ Accepted connections query successful');
      console.log('📊 Accepted connections found:', acceptedConnections?.length || 0);

      if (acceptedConnections && acceptedConnections.length > 0) {
        console.log('📋 Sample accepted connection:');
        console.log('  - Sender ID:', acceptedConnections[0].sender_id);
        console.log('  - Receiver ID:', acceptedConnections[0].receiver_id);
        console.log('  - Sender name:', acceptedConnections[0].sender?.full_name);
        console.log('  - Receiver name:', acceptedConnections[0].receiver?.full_name);
        console.log('  - Created at:', acceptedConnections[0].created_at);
      }
    }

    // Test the relationship joins
    console.log('\n3. Testing user relationship joins...');

    const { data: testJoin, error: joinError } = await supabase
      .from('connection_requests')
      .select('sender:users!connection_requests_sender_id_fkey(full_name)')
      .limit(1);

    if (joinError) {
      console.log('❌ Error with user relationship joins:', joinError.message);
    } else {
      console.log('✅ User relationship joins working correctly');
    }

    // Test messages table to see if there are active conversations
    console.log('\n4. Testing messages table for active conversations...');

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('connection_id, sender_id, content, sent_at')
      .limit(5);

    if (messagesError) {
      console.log('❌ Error accessing messages:', messagesError.message);
    } else {
      console.log('✅ Messages table accessible');
      console.log('📊 Recent messages found:', messages?.length || 0);

      if (messages && messages.length > 0) {
        // Get unique connection IDs from messages
        const uniqueConnectionIds = [...new Set(messages.map(m => m.connection_id))];
        console.log('💬 Active conversation connection IDs:', uniqueConnectionIds);

        // Check if these connections are accepted
        for (const connId of uniqueConnectionIds) {
          const { data: connStatus, error: statusError } = await supabase
            .from('connection_requests')
            .select('status')
            .eq('connection_id', connId)
            .single();

          if (!statusError && connStatus) {
            console.log(`   Connection ${connId}: status = ${connStatus.status}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n=== CONNECTIONS TEST COMPLETE ===');
}

testConnectionsFetching();
