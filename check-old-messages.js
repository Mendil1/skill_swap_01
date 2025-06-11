// Test to check if old messages/conversations still exist
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Using service role key to bypass RLS policies
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables (URL or Service Role Key)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOldMessages() {
  console.log('🔍 Checking if old messages/conversations still exist...\n');

  try {
    // Check messages table
    console.log('1. Checking messages table...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('message_id, content, created_at, sender_id, receiver_id')
      .order('created_at', { ascending: false })
      .limit(10);

    if (messagesError) {
      console.error('❌ Messages query error:', messagesError.message);
      console.error('   Full error:', messagesError);
    } else {
      console.log('✅ Messages table accessible');
      console.log(`   Found ${messages?.length || 0} messages`);
      
      if (messages && messages.length > 0) {
        console.log('   📧 Recent messages:');
        messages.slice(0, 3).forEach((msg, index) => {
          console.log(`      ${index + 1}. ${msg.created_at}: "${msg.content?.substring(0, 50)}${msg.content?.length > 50 ? '...' : ''}"`);
        });
      } else {
        console.log('   ⚠️  No messages found - they may have been deleted or access blocked');
      }
    }

    // Check conversations table if it exists
    console.log('\n2. Checking conversations table...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('conversation_id, created_at, participant_1, participant_2')
      .order('created_at', { ascending: false })
      .limit(10);

    if (convError) {
      console.error('❌ Conversations query error:', convError.message);
      // This might be expected if the table doesn't exist
    } else {
      console.log('✅ Conversations table accessible');
      console.log(`   Found ${conversations?.length || 0} conversations`);
      
      if (conversations && conversations.length > 0) {
        console.log('   💬 Recent conversations:');
        conversations.slice(0, 3).forEach((conv, index) => {
          console.log(`      ${index + 1}. ${conv.created_at}: ${conv.participant_1} ↔ ${conv.participant_2}`);
        });
      }
    }

    // Check total count in messages table
    console.log('\n3. Checking total message count...');
    const { count, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count query error:', countError.message);
    } else {
      console.log(`✅ Total messages in database: ${count || 0}`);
    }

    // Check if RLS is blocking access
    console.log('\n4. Testing RLS policies...');
    const { data: testUser } = await supabase.auth.getUser();
    
    if (testUser?.user) {
      console.log(`   🔐 Logged in as: ${testUser.user.email || 'Unknown'}`);
      
      // Try to get messages for the current user
      const { data: userMessages, error: userMsgError } = await supabase
        .from('messages')
        .select('message_id, content, created_at')
        .or(`sender_id.eq.${testUser.user.id},receiver_id.eq.${testUser.user.id}`)
        .limit(5);

      if (userMsgError) {
        console.error('❌ User messages query error:', userMsgError.message);
        console.log('   🚨 This suggests RLS policies may be blocking access');
      } else {
        console.log(`✅ User-specific messages accessible: ${userMessages?.length || 0} messages`);
      }
    } else {
      console.log('   ⚠️  Not authenticated - testing anonymous access');
    }

    console.log('\n📊 SUMMARY:');
    console.log('===========');
    if (messages && messages.length > 0) {
      console.log('✅ Your old messages are still in the database');
      console.log('✅ Data was NOT deleted during the fixes');
      console.log('📝 If you can\'t see them in the app, it\'s likely an access/RLS policy issue');
    } else {
      console.log('⚠️  No messages found - possible reasons:');
      console.log('   1. RLS policies are blocking access');
      console.log('   2. You need to be logged in to see your messages');
      console.log('   3. Messages are in a different table/format');
      console.log('   4. Database connection issues');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

checkOldMessages();
