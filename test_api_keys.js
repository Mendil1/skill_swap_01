#!/usr/bin/env node
/**
 * Test API Keys Directly
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5ODU0NywiZXhwIjoyMDU5OTc0NTQ3fQ.X9ioLRXEOsCnlLx4bWYDCBQoQUbITVgTzCqMd3JMB-8';

async function testKeys() {
  console.log('🔑 TESTING API KEYS\n');

  // Test 1: Anon Client
  console.log('1. Testing ANON key...');
  try {
    const anonClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data, error } = await anonClient.from('users').select('count').limit(1);
    if (error) {
      console.log('   ❌ Anon key error:', error.message);
    } else {
      console.log('   ✅ Anon key works');
    }
  } catch (err) {
    console.log('   ❌ Anon key exception:', err.message);
  }

  // Test 2: Service Role Client
  console.log('\n2. Testing SERVICE ROLE key...');
  try {
    const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error } = await serviceClient.from('users').select('count').limit(1);
    if (error) {
      console.log('   ❌ Service key error:', error.message);
    } else {
      console.log('   ✅ Service key works');
    }
  } catch (err) {
    console.log('   ❌ Service key exception:', err.message);
  }

  // Test 3: Connection Test
  console.log('\n3. Testing basic connection...');
  try {
    const client = createClient(SUPABASE_URL, ANON_KEY);
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.log('   ❌ Connection error:', error.message);
    } else {
      console.log('   ✅ Connection works');
    }
  } catch (err) {
    console.log('   ❌ Connection exception:', err.message);
  }

  // Test 4: Check if we can access any table with RLS disabled
  console.log('\n4. Testing table access patterns...');
  const client = createClient(SUPABASE_URL, ANON_KEY);

  const tables = ['messages', 'users', 'sessions', 'notifications'];

  for (const table of tables) {
    try {
      const { data, error } = await client.from(table).select('*').limit(1);
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: accessible (${data?.length || 0} rows)`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }
}

testKeys().catch(console.error);
