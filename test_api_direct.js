// Simple database test without external dependencies
const https = require('https');

async function testAPI() {
  console.log('Testing notification API directly...');

  const testData = JSON.stringify({
    userId: '12345678-1234-5678-9abc-123456789012',
    type: 'test',
    message: 'Testing notification creation'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response data:', data);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log('Request error:', err.message);
      reject(err);
    });

    req.write(testData);
    req.end();
  });
}

// Test if server is running
async function checkServer() {
  try {
    await testAPI();
  } catch (err) {
    console.log('Server not running or API test failed');
    console.log('Please start the dev server with: npm run dev');
  }
}

checkServer();
