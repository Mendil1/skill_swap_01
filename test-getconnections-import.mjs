// Test import of getConnections function
import { getConnections } from './src/lib/actions/sessions.js';

console.log('getConnections function:', typeof getConnections);

if (typeof getConnections === 'function') {
  console.log('✅ getConnections is properly exported as a function');
} else {
  console.log('❌ getConnections is not available or not a function');
}
