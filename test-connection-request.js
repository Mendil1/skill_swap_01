// Test script to check connection request functionality
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Using service role key to bypass RLS policies
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnectionRequest() {
  try {
    console.log('Testing connection request functionality...');
    
    // Test 1: Check if we can read connection_requests table
    console.log('\n1. Testing connection_requests table access...');
    const { data: connectionData, error: connectionError } = await supabase
      .from('connection_requests')
      .select('*')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Cannot read connection_requests:', connectionError);
    } else {
      console.log('✅ Can read connection_requests table');
      console.log('Sample data:', connectionData);
    }
    
    // Test 2: Check if we can read users table
    console.log('\n2. Testing users table access...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id, full_name')
      .limit(2);
    
    if (userError) {
      console.error('❌ Cannot read users:', userError);
    } else {
      console.log('✅ Can read users table');
      console.log('Sample users:', userData);
    }
    
    // Test 3: Check current auth status
    console.log('\n3. Testing auth status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
    } else if (!user) {
      console.log('❌ No authenticated user');
    } else {
      console.log('✅ Authenticated user:', user.id);
    }
    
    // Test 4: Test notification API
    console.log('\n4. Testing notification API...');
    if (userData && userData.length >= 1) {
      const testUserId = userData[0].user_id;
      const response = await fetch('http://localhost:3000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: testUserId,
          type: 'test',
          message: 'Test notification',
          referenceId: 'test-123'
        })
      });
      
      const result = await response.text();
      console.log('Notification API response:', response.status, result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnectionRequest();
