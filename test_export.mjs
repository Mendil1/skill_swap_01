// Test getUserConnections export
import { getUserConnections } from './src/lib/actions/sessions.js';

console.log('getUserConnections function:', typeof getUserConnections);

if (typeof getUserConnections === 'function') {
  console.log('✅ getUserConnections is properly exported');
} else {
  console.log('❌ getUserConnections is not a function');
}
