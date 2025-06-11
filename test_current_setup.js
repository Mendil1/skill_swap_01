// Simple test to verify current setup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Current Setup');
console.log('======================');
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Service Key:', supabaseServiceKey ? '✅ Found (length: ' + supabaseServiceKey.length + ')' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('\n🔗 Testing Supabase Connection...');

    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact' })
      .limit(1);

    if (error) {
      console.log('❌ Connection Error:', error.message);
      console.log('Error Details:', error);
    } else {
      console.log('✅ Connection Successful!');
      console.log('Users table accessible:', data ? '✅' : '❌');
    }

    // Test RLS status by trying to access data
    console.log('\n🛡️  Testing RLS Status...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(3);

    if (userError) {
      console.log('❌ Users Access Error:', userError.message);
      console.log('🔒 RLS might still be active');
    } else {
      console.log('✅ Users Access Successful!');
      console.log(`📊 Found ${userData.length} user records`);
      console.log('🔓 RLS appears to be bypassed with service key');
    }

  } catch (err) {
    console.log('❌ Test Failed:', err.message);
  }
}

testConnection();
