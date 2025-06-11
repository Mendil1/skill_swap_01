console.log('🚀 Testing messaging system fix...');

// Test database connection and message fetching
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMessagingSystem() {
  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection
    const { data: testConnection, error: connectionError } = await supabase
      .from('messages')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return false;
    }

    console.log('✅ Database connection successful');

    // Test message fetching with correct schema
    console.log('📨 Testing message fetching...');
    const { data: messages, error: messageError } = await supabase
      .from('messages')
      .select('message_id, connection_id, sender_id, content, sent_at')
      .limit(5);

    if (messageError) {
      console.error('❌ Message fetching failed:', messageError);
      return false;
    }

    console.log(`✅ Successfully fetched ${messages?.length || 0} messages`);
    console.log('📋 Sample message structure:', messages?.[0] || 'No messages found');

    // Test connection requests
    console.log('🔗 Testing connection requests...');
    const { data: connections, error: connectionReqError } = await supabase
      .from('connection_requests')
      .select('connection_id, sender_id, receiver_id')
      .limit(3);

    if (connectionReqError) {
      console.error('❌ Connection requests failed:', connectionReqError);
      return false;
    }

    console.log(`✅ Found ${connections?.length || 0} connections`);

    return true;
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

// Run the test
testMessagingSystem().then(success => {
  if (success) {
    console.log('\n🎉 Messaging system test PASSED!');
    console.log('📱 Your messaging system should now work properly.');
    console.log('💡 To test in browser:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Go to: http://localhost:3000/messages');
    console.log('   3. Open a conversation with existing messages');
    console.log('   4. You should see your old messages displayed');
  } else {
    console.log('\n❌ Messaging system test FAILED!');
    console.log('🔧 Please check the errors above and fix them.');
  }
}).catch(error => {
  console.error('❌ Test script failed:', error);
});
