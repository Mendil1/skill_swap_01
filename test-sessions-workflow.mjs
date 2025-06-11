// Test the complete sessions workflow
import { getSessionsServerAction } from './src/lib/actions/get-sessions.js';

async function testSessionsWorkflow() {
  console.log('🧪 Testing Complete Sessions Workflow');
  console.log('====================================');

  try {
    console.log('\n1️⃣ Testing getSessionsServerAction...');

    // Mock a user ID for testing
    const mockUserId = 'test-user-id';

    const result = await getSessionsServerAction();

    if (result.success) {
      console.log('✅ Sessions fetched successfully');
      console.log('📊 Results:');
      console.log(`   - Individual sessions: ${result.data.sessions.length}`);
      console.log(`   - Group sessions: ${result.data.groupSessions.length}`);

      // Check data structure
      if (result.data.sessions.length > 0) {
        const session = result.data.sessions[0];
        console.log('📋 Session structure:', Object.keys(session));
      }

      if (result.data.groupSessions.length > 0) {
        const groupSession = result.data.groupSessions[0];
        console.log('📋 Group session structure:', Object.keys(groupSession));
      }

    } else {
      console.log('❌ Sessions fetch failed:', result.error);
    }

  } catch (error) {
    console.error('💥 Workflow test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the development server is running (npm run dev)');
    console.log('2. Apply database schema fixes at /fix-sessions-schema');
    console.log('3. Check that Supabase environment variables are set');
  }
}

// Note: This needs to be run in a Node.js environment with ES modules support
// Run with: node --experimental-modules test-sessions-workflow.mjs
export { testSessionsWorkflow };
