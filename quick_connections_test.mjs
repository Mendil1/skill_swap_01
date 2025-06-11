// Test connections functionality in a simpler way
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

async function quickConnectionsTest() {
  console.log('Quick connections test starting...');

  // Test 1: Check if connection_requests table exists and has data
  const { data: connections } = await supabase
    .from('connection_requests')
    .select('*')
    .limit(3);

  console.log('Connections found:', connections?.length || 0);

  if (connections && connections.length > 0) {
    console.log('Sample connection:', connections[0]);
  }

  // Test 2: Check accepted connections
  const { data: accepted } = await supabase
    .from('connection_requests')
    .select('*')
    .eq('status', 'accepted')
    .limit(3);

  console.log('Accepted connections:', accepted?.length || 0);

  // Test 3: Check messages to see active conversations
  const { data: messages } = await supabase
    .from('messages')
    .select('connection_id')
    .limit(3);

  console.log('Message conversations:', messages?.length || 0);

  console.log('Test completed.');
}

quickConnectionsTest().catch(console.error);
