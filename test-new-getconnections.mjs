// Test the new getConnections function
import { getConnections } from './src/lib/actions/get-connections.js';

async function testGetConnections() {
  console.log('🔍 Testing new getConnections function...');
  
  try {
    const result = await getConnections();
    console.log('✅ Function imported successfully');
    console.log('Result:', result);
    
    if (result && typeof result === 'object' && 'connections' in result) {
      console.log('✅ Function returns correct structure');
      console.log('Connections found:', result.connections.length);
    } else {
      console.log('❌ Function returns unexpected structure');
    }
  } catch (error) {
    console.log('❌ Function test failed:', error.message);
  }
}

testGetConnections();
