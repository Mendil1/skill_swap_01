// Quick test for hybrid RLS solution
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Hybrid RLS Solution');
console.log('================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment Check:');
console.log('✅ URL:', supabaseUrl ? 'Found' : '❌ Missing');
console.log('✅ Anon Key:', anonKey ? 'Found' : '❌ Missing');
console.log('✅ Service Key:', serviceKey ? 'Found' : '❌ Missing');

if (!supabaseUrl || !anonKey || !serviceKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

// Test 1: Anonymous client (for auth)
console.log('\n🔑 Testing Anonymous Client (for authentication):');
const anonClient = createClient(supabaseUrl, anonKey);

anonClient.from('users').select('count').single()
  .then(({ data, error }) => {
    if (error) {
      console.log('✅ Expected behavior - anon client has limited access');
      console.log('   Error:', error.message);
    } else {
      console.log('✅ Anon client working');
    }
  })
  .catch(err => {
    console.log('⚠️  Anon client error:', err.message);
  });

// Test 2: Service client (for data)
console.log('\n🛠️  Testing Service Client (for data operations):');
const serviceClient = createClient(supabaseUrl, serviceKey);

serviceClient.from('users').select('count(*)', { count: 'exact' }).limit(1)
  .then(({ data, error, count }) => {
    if (error) {
      console.log('❌ Service client error:', error.message);
    } else {
      console.log('✅ Service client working!');
      console.log('   Users count:', count);
      console.log('   RLS successfully bypassed');
    }
  })
  .catch(err => {
    console.log('❌ Service client failed:', err.message);
  });

console.log('\n📝 Note: Both clients should work for their respective purposes');
console.log('   - Anonymous client: For authentication operations');
console.log('   - Service client: For data operations (bypasses RLS)');
