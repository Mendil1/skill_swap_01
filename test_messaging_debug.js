const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sogwgxkxuuvvvjbqlcdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMessagingSystem() {
  console.log('🔍 Testing Messaging System Database...\n');

  // Test 1: Check connection_requests table
  console.log('1. Testing connection_requests table:');
  try {
    const { data: connections, error } = await supabase
      .from('connection_requests')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Error fetching connections:', error.message);
      console.log('Full error:', error);
    } else {
      console.log('✅ Connections found:', connections.length);
      if (connections.length > 0) {
