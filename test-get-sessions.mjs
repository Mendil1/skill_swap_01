// Test file to check get-sessions import
try {
  const { getSessionsServerAction } = await import('./src/lib/actions/get-sessions.js');
  console.log('✅ getSessionsServerAction imported successfully:', typeof getSessionsServerAction);
} catch (error) {
  console.error('❌ Error importing getSessionsServerAction:', error.message);
}
