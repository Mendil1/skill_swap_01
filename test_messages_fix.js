#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function testMessagesFixedQuery() {
  console.log('🧪 TESTING MESSAGES PAGE FIXED QUERY');
  console.log('='.repeat(50));

  try {
    // Get available users first
    console.log('\n1. Getting available users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, full_name, email')
      .limit(5);

    if (usersError || !users || users.length === 0) {
      console.log('❌ No users found:', usersError?.message);
      return;
    }

    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user, i) => {
      console.log(`   ${i+1}. ${user.full_name} (${user.user_id})`);
    });

    const testUser = users[0];
    console.log(`\n🧑‍💻 Testing messages query for: ${testUser.full_name}`);

    // Step 1: Test connection requests query
    console.log('\n2. Getting user connections...');
    const { data: connections, error: connectionsError } = await supabase
      .from("connection_requests")
      .select("*")
      .or(`sender_id.eq.${testUser.user_id},receiver_id.eq.${testUser.user_id}`)
      .eq("status", "accepted");

    if (connectionsError) {
      console.log('❌ Error getting connections:', connectionsError.message);
    } else {
      console.log(`✅ Found ${connections?.length || 0} accepted connections`);
      if (connections && connections.length > 0) {
        connections.forEach(conn => {
          console.log(`   Connection: ${conn.sender_id} → ${conn.receiver_id} (${conn.connection_id})`);
        });
      }
    }

    if (!connections || connections.length === 0) {
      console.log('\n⚠️ No connections found. Creating test connection...');

      // Create a test connection if we have at least 2 users
      if (users.length >= 2) {
        const testConnection = {
          sender_id: users[0].user_id,
          receiver_id: users[1].user_id,
          status: 'accepted',
          created_at: new Date().toISOString()
        };

        const { data: newConn, error: connError } = await supabase
          .from('connection_requests')
          .insert(testConnection)
          .select()
          .single();

        if (connError) {
          console.log('❌ Failed to create test connection:', connError.message);
        } else {
          console.log('✅ Created test connection:', newConn.connection_id);
          connections = [newConn];
        }
      }
    }

    if (connections && connections.length > 0) {
      // Step 2: Test messages query
      const connectionIds = connections.map(conn => conn.connection_id);
      console.log('\n3. Getting messages for connections:', connectionIds);

      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select(`
          message_id,
          content,
          sent_at,
          sender_id,
          connection_id
        `)
        .in("connection_id", connectionIds)
        .order("sent_at", { ascending: false })
        .limit(20);

      if (messagesError) {
        console.log('❌ Error getting messages:', messagesError.message);
      } else {
        console.log(`✅ Found ${messages?.length || 0} messages`);
        if (messages && messages.length > 0) {
          messages.forEach(msg => {
            console.log(`   Message: ${msg.sender_id} -> "${msg.content.substring(0, 30)}..." (${msg.sent_at})`);
          });
        } else {
          console.log('\n⚠️ No messages found. Creating test message...');

          // Create a test message
          const testMessage = {
            connection_id: connectionIds[0],
            sender_id: testUser.user_id,
            content: 'This is a test message to verify the messaging system works correctly.',
            sent_at: new Date().toISOString()
          };

          const { data: newMessage, error: msgError } = await supabase
            .from('messages')
            .insert(testMessage)
            .select()
            .single();

          if (msgError) {
            console.log('❌ Failed to create test message:', msgError.message);
          } else {
            console.log('✅ Created test message:', newMessage.message_id);
            messages = [newMessage];
          }
        }
      }

      if (messages && messages.length > 0) {
        // Step 3: Test sender details query
        const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
        console.log('\n4. Getting sender details for:', senderIds);

        const { data: senders, error: sendersError } = await supabase
          .from("users")
          .select("user_id, full_name, email, profile_image_url")
          .in("user_id", senderIds);

        if (sendersError) {
          console.log('❌ Error getting senders:', sendersError.message);
        } else {
          console.log(`✅ Found ${senders?.length || 0} senders`);
          if (senders && senders.length > 0) {
            senders.forEach(sender => {
              console.log(`   Sender: ${sender.full_name} (${sender.user_id})`);
            });
          }

          // Step 4: Test transformation
          console.log('\n5. Testing message transformation...');
          const sendersMap = new Map(senders?.map(sender => [sender.user_id, sender]) || []);

          const transformedMessages = messages.map(msg => {
            const sender = sendersMap.get(msg.sender_id);
            return {
              id: msg.message_id,
              sender: {
                id: msg.sender_id,
                name: sender?.full_name || sender?.email || "Unknown User",
                avatar: sender?.profile_image_url || null,
              },
              content: msg.content,
              timestamp: msg.sent_at,
              isRead: msg.sender_id !== testUser.user_id,
            };
          });

          console.log(`✅ Successfully transformed ${transformedMessages.length} messages:`);
          transformedMessages.forEach(msg => {
            console.log(`   - ${msg.sender.name}: "${msg.content.substring(0, 30)}..." [${msg.isRead ? 'read' : 'unread'}]`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testMessagesFixedQuery();
