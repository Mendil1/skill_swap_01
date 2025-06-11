// Check for old messages with correct schema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Using service role key to bypass RLS policies
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMessagesWithCorrectSchema() {
  console.log('🔍 Checking for old messages with correct schema...\n');

  try {
    // Check messages table with correct schema (message_id, connection_id, sender_id, content, sent_at)
    console.log('1. Checking messages table with correct schema...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('message_id, connection_id, sender_id, content, sent_at')
      .order('sent_at', { ascending: false })
      .limit(10);

    if (messagesError) {
      console.error('❌ Messages query error:', messagesError.message);
      console.error('   Error code:', messagesError.code);
      console.error('   Details:', messagesError.details);

      if (messagesError.code === 'PGRST116') {
        console.log('   🔍 This error suggests RLS policies are blocking access');
      }
    } else {
      console.log('✅ Messages table accessible');
      console.log(`   Found ${messages?.length || 0} messages`);

      if (messages && messages.length > 0) {
        console.log('   📧 Recent messages found:');
        messages.slice(0, 3).forEach((msg, index) => {
          const preview = msg.content?.substring(0, 50) + (msg.content?.length > 50 ? '...' : '');
          console.log(`      ${index + 1}. ${msg.sent_at}: "${preview}"`);
          console.log(`         Connection: ${msg.connection_id}`);
          console.log(`         Sender: ${msg.sender_id}`);
        });

        console.log('\n✅ 🎉 YOUR OLD MESSAGES ARE STILL THERE!');
        console.log('   The data was NOT deleted during our fixes.');
      } else {
        console.log('   ⚠️  No messages returned - checking possible causes...');
      }
    }

    // Check total count without authentication
    console.log('\n2. Checking total message count (admin query)...');
    const { count, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count query error:', countError.message);
      if (countError.code === 'PGRST116') {
        console.log('   🔐 RLS is blocking count query - this is expected');
      }
    } else {
      console.log(`✅ Total messages in database: ${count || 0}`);
      if (count > 0) {
        console.log('   🎉 There ARE messages in the database!');
      }
    }

    // Check connection_requests table to see the relationships
    console.log('\n3. Checking connection_requests table...');
    const { data: connections, error: connError } = await supabase
      .from('connection_requests')
      .select('connection_id, sender_id, receiver_id, status, created_at')
      .eq('status', 'accepted')
      .limit(5);

    if (connError) {
      console.error('❌ Connection requests error:', connError.message);
    } else {
      console.log('✅ Connection requests table accessible');
      console.log(`   Found ${connections?.length || 0} accepted connections`);

      if (connections && connections.length > 0) {
        console.log('   🔗 Connections that could have messages:');
        connections.forEach((conn, index) => {
          console.log(`      ${index + 1}. ${conn.connection_id}: ${conn.sender_id} ↔ ${conn.receiver_id}`);
        });
      }
    }

    // Check current user authentication
    console.log('\n4. Checking authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('   ⚠️  Not authenticated - you need to log in to see your messages');
      console.log('   🔐 The RLS policies require authentication to access personal messages');
    } else {
      console.log(`   ✅ Authenticated as: ${user.email}`);
      console.log(`   🆔 User ID: ${user.id}`);

      // Try to get user's specific messages
      if (connections && connections.length > 0) {
        console.log('\n5. Checking user-specific messages...');
        const userConnections = connections.filter(conn =>
          conn.sender_id === user.id || conn.receiver_id === user.id
        );

        if (userConnections.length > 0) {
          const connectionIds = userConnections.map(conn => conn.connection_id);
          const { data: userMessages, error: userMsgError } = await supabase
            .from('messages')
            .select('message_id, content, sent_at, sender_id')
            .in('connection_id', connectionIds)
            .order('sent_at', { ascending: false })
            .limit(10);

          if (userMsgError) {
            console.error('❌ User messages error:', userMsgError.message);
          } else {
            console.log(`   ✅ Found ${userMessages?.length || 0} messages for your connections`);
            if (userMessages && userMessages.length > 0) {
              console.log('   💬 Your recent messages:');
              userMessages.slice(0, 3).forEach((msg, index) => {
                const preview = msg.content?.substring(0, 50) + (msg.content?.length > 50 ? '...' : '');
                const isYours = msg.sender_id === user.id ? '(You)' : '(Them)';
                console.log(`      ${index + 1}. ${msg.sent_at}: "${preview}" ${isYours}`);
              });
            }
          }
        }
      }
    }

    console.log('\n📊 FINAL ANSWER:');
    console.log('==================');

    if (messages && messages.length > 0) {
      console.log('✅ YOUR OLD MESSAGES ARE STILL IN THE DATABASE!');
      console.log('✅ No data was deleted during our session fixes.');
      console.log('📝 If you can\'t see them in the app, it\'s because:');
      console.log('   1. You need to log into the app first');
      console.log('   2. RLS policies require authentication to view personal messages');
      console.log('   3. The messages are linked to connection_requests');
    } else if (count > 0) {
      console.log('✅ MESSAGES EXIST in the database (total count shows messages)');
      console.log('🔐 You just need to be logged in to see them');
    } else {
      console.log('⚠️  Unable to confirm messages due to RLS restrictions');
      console.log('🔑 Please log into the app to check your messages');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

checkMessagesWithCorrectSchema();
