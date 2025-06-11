// 🧪 BROWSER CONSOLE TEST
// Copy and paste this into your browser console (F12) while on the SkillSwap app

console.log('🧪 Starting browser-based connection test...');

// Test the getUserConnections function directly
async function testConnectionsInBrowser() {
  try {
    console.log('1. Testing import of getUserConnections...');

    // This should match your import path
    const { getUserConnections } = await import('/src/lib/utils/connections.ts');

    console.log('✅ Import successful');

    console.log('2. Calling getUserConnections...');
    const connections = await getUserConnections();

    console.log('✅ Function call successful');
    console.log('📊 Result:', connections);
    console.log('📊 Number of connections:', connections?.length || 0);

    if (connections && connections.length > 0) {
      console.log('🎉 Success! Found connections:');
      connections.forEach((conn, i) => {
        console.log(`  ${i+1}. ${conn.full_name} (${conn.user_id})`);
      });
    } else {
      console.log('⚠️ No connections found. This explains the UI issue.');
      console.log('💡 You need to create connections first through the messaging system.');
    }

  } catch (error) {
    console.error('❌ Error in browser test:', error);
    console.log('💡 Try refreshing the page and running the test again.');
  }
}

// Also test Supabase connection directly
async function testSupabaseInBrowser() {
  try {
    console.log('3. Testing direct Supabase connection...');

    // This should work if Supabase is available globally
    if (window.supabase) {
      console.log('✅ Supabase available globally');

      const { data: { user }, error } = await window.supabase.auth.getUser();

      if (error) {
        console.log('❌ Auth error:', error.message);
      } else if (user) {
        console.log('✅ User authenticated:', user.id);

        // Test the connection query directly
        const { data: connections, error: queryError } = await window.supabase
          .from('connection_requests')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (queryError) {
          console.log('❌ Query error:', queryError.message);
        } else {
          console.log('✅ Direct query successful');
          console.log('📊 Raw connections:', connections?.length || 0);
        }
      } else {
        console.log('❌ No authenticated user');
      }
    } else {
      console.log('❌ Supabase not available globally');
    }
  } catch (error) {
    console.error('❌ Error in Supabase test:', error);
  }
}

// Run both tests
console.log('🚀 Running browser tests...');
testConnectionsInBrowser();
testSupabaseInBrowser();

console.log('📋 Tests complete. Check the output above for results.');
