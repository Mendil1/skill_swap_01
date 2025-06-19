/**
 * Test Supabase Connection and Login
 * Run this in browser console on the login page
 */

console.log('🔍 TESTING SUPABASE CONNECTION & LOGIN');
console.log('=====================================');

async function testSupabaseLogin() {
  try {
    console.log('1. Loading Supabase client...');
    const { createClient } = await import('/src/utils/supabase/client.js');
    const supabase = createClient();
    console.log('✅ Supabase client loaded');

    console.log('2. Testing connection...');
    const { data, error } = await supabase.auth.getSession();
    console.log('Current session:', data.session?.user?.email || 'none');
    console.log('Session error:', error);

    console.log('3. Testing login with demo credentials...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test123'
    });

    if (loginError) {
      console.log('❌ Login failed:', loginError.message);

      // Try with different credentials
      console.log('4. Trying alternative credentials...');
      const { data: altLoginData, error: altError } = await supabase.auth.signInWithPassword({
        email: 'demo@skillswap.com',
        password: 'demo123'
      });

      if (altError) {
        console.log('❌ Alternative login failed:', altError.message);
        console.log('💡 You may need to create a user account first');
      } else {
        console.log('✅ Alternative login successful!');
        console.log('User:', altLoginData.user?.email);
      }
    } else {
      console.log('✅ Login successful!');
      console.log('User:', loginData.user?.email);
    }

  } catch (error) {
    console.log('❌ Error during test:', error);
  }
}

// Test if we can create a new user
async function testSupabaseSignup() {
  try {
    console.log('\n🆕 TESTING SIGNUP...');
    const { createClient } = await import('/src/utils/supabase/client.js');
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123'
    });

    if (error) {
      console.log('❌ Signup failed:', error.message);
    } else {
      console.log('✅ Signup successful!');
      console.log('User:', data.user?.email);
      console.log('Check your email for confirmation (if required)');
    }
  } catch (error) {
    console.log('❌ Signup error:', error);
  }
}

// Run the tests
testSupabaseLogin();

// Export functions for manual use
window.testSupabaseLogin = testSupabaseLogin;
window.testSupabaseSignup = testSupabaseSignup;

console.log('\n📝 Available functions:');
console.log('- testSupabaseLogin() - Test login with demo credentials');
console.log('- testSupabaseSignup() - Test creating a new user');
