/**
 * Authentication Flow Debug Script
 *
 * This script helps debug authentication issues in the SkillSwap application.
 * Run this to check authentication state and flow.
 */

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url' || supabaseKey === 'your-supabase-key') {
  console.error('❌ Please set your Supabase environment variables in .env.local');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuthFlow() {
  console.log('🔍 SkillSwap Authentication Debug');
  console.log('==================================');

  try {
    // Test 1: Check Supabase connection
    console.log('\n📡 Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log('❌ Connection error:', error.message);
      return;
    }

    console.log('✅ Supabase connection successful');

    // Test 2: Check current session
    console.log('\n🔐 Checking current session...');
    if (data.session) {
      console.log('✅ Active session found');
      console.log('   User ID:', data.session.user.id);
      console.log('   Email:', data.session.user.email);
      console.log('   Expires at:', new Date(data.session.expires_at * 1000).toISOString());
    } else {
      console.log('ℹ️ No active session');
    }

    // Test 3: Check user
    console.log('\n👤 Checking user...');
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.log('❌ User check error:', userError.message);
    } else if (userData.user) {
      console.log('✅ User found');
      console.log('   User ID:', userData.user.id);
      console.log('   Email:', userData.user.email);
      console.log('   Last sign in:', userData.user.last_sign_in_at);
    } else {
      console.log('ℹ️ No user found');
    }

    // Test 4: Try to fetch user profile from database
    if (userData.user) {
      console.log('\n📊 Checking user profile in database...');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile fetch error:', profileError.message);

        // Try by email
        console.log('   Trying to find profile by email...');
        const { data: profileByEmail, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', userData.user.email)
          .single();

        if (emailError) {
          console.log('❌ Profile by email error:', emailError.message);
        } else if (profileByEmail) {
          console.log('✅ Profile found by email');
          console.log('   Full name:', profileByEmail.full_name);
          console.log('   User ID mismatch - Profile:', profileByEmail.user_id, 'Auth:', userData.user.id);
        }
      } else if (profile) {
        console.log('✅ Profile found');
        console.log('   Full name:', profile.full_name);
        console.log('   Email:', profile.email);
      }
    }

    console.log('\n🎯 Debug Summary');
    console.log('================');
    console.log('Session:', data.session ? '✅ Active' : '❌ None');
    console.log('User:', userData.user ? '✅ Found' : '❌ None');
    console.log('Auth State:', userData.user && data.session ? '✅ Fully authenticated' : '❌ Not authenticated');

    if (!userData.user || !data.session) {
      console.log('\n🚨 Authentication Issue Detected');
      console.log('Possible causes:');
      console.log('- User needs to log in');
      console.log('- Session expired');
      console.log('- Cookie/local storage issues');
      console.log('- Environment variable mismatch');
    }

  } catch (error) {
    console.error('💥 Debug script error:', error);
  }
}

// Run the debug
debugAuthFlow();
