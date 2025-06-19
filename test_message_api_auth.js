// Test script to verify message API authentication
console.log('🧪 Testing Message API Authentication...');

// Test authentication endpoint
fetch('/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    connectionId: 'test-connection-id',
    content: 'Test message'
  })
})
.then(async response => {
  const result = await response.json();
  console.log('📡 API Response Status:', response.status);
  console.log('📡 API Response Body:', result);

  if (response.status === 401) {
    console.log('🔐 Authentication required - this is expected');
    console.log('✅ API endpoint is working, just needs proper auth');
  } else if (response.status === 400) {
    console.log('✅ API validation working');
  } else {
    console.log('🎉 API call successful!');
  }
})
.catch(error => {
  console.error('❌ API Error:', error);
});

// Test browser authentication state
if (typeof window !== 'undefined') {
  console.log('🍪 Browser Cookies:', document.cookie);
  console.log('🔍 Looking for Supabase auth cookie...');

  const authCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('sb-sogwgxkxuuvvvjbqlcdo-auth-token='));

  if (authCookie) {
    console.log('✅ Supabase auth cookie found');
    console.log('🔐 Cookie preview:', authCookie.substring(0, 50) + '...');
  } else {
    console.log('❌ No Supabase auth cookie found');
  }
}

export {};
