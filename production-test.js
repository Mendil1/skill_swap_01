// Production Test Script for Interactive Messages
// Run this in your browser console on the production site

console.log('🚀 Starting Production Test for Interactive Messages...');
console.log('================================================');

// Test 1: Environment Check
console.log('1. Environment Check:');
console.log('   - Current URL:', window.location.href);
console.log('   - Protocol:', window.location.protocol);
console.log('   - Is HTTPS:', window.location.protocol === 'https:' ? '✅' : '⚠️ HTTP');

// Test 2: Authentication Status
console.log('\n2. Authentication Check:');
const authCookies = document.cookie.split(';').filter(c => c.includes('sb-'));
console.log('   - Auth cookies found:', authCookies.length > 0 ? '✅ YES' : '❌ NO');
if (authCookies.length > 0) {
  authCookies.forEach(cookie => {
    const name = cookie.trim().split('=')[0];
    console.log('   - Cookie:', name);
  });
}

// Test 3: Page Load Check
console.log('\n3. Page Load Check:');
console.log('   - Current page:', window.location.pathname);
console.log('   - Page loaded:', document.readyState === 'complete' ? '✅' : '⚠️ Loading');

// Test 4: API Connectivity Test
console.log('\n4. API Connectivity Test:');
fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'production-connectivity' })
})
.then(async response => {
  console.log('   - API Response Status:', response.status);
  const result = await response.json().catch(() => ({}));

  if (response.status === 400) {
    console.log('   - ✅ API validation working (expected 400 for test data)');
  } else if (response.status === 401) {
    console.log('   - ✅ API authentication required (expected behavior)');
  } else if (response.status === 200) {
    console.log('   - ✅ API responding successfully');
  } else {
    console.log('   - ⚠️ Unexpected status:', response.status);
  }

  console.log('   - Response:', result);
})
.catch(error => {
  console.log('   - ❌ API Error:', error.message);
});

// Test 5: Interactive Elements Check
console.log('\n5. Interactive Elements Check:');
setTimeout(() => {
  const conversationCards = document.querySelectorAll('[data-testid="conversation-card"], .cursor-pointer');
  console.log('   - Conversation cards found:', conversationCards.length);

  const dialogs = document.querySelectorAll('[role="dialog"]');
  console.log('   - Dialog elements:', dialogs.length);

  const messageInputs = document.querySelectorAll('textarea[placeholder*="message"], textarea[placeholder*="Type"]');
  console.log('   - Message inputs:', messageInputs.length);

  if (conversationCards.length > 0) {
    console.log('   - ✅ Conversation cards available for testing');
  } else {
    console.log('   - ⚠️ No conversation cards found (may need to create connections first)');
  }
}, 2000);

// Test 6: Error Monitoring
console.log('\n6. Setting up Error Monitoring:');
let errorCount = 0;
window.addEventListener('error', (event) => {
  errorCount++;
  console.error(`❌ JavaScript Error #${errorCount}:`, event.message);
  console.error('   - File:', event.filename);
  console.error('   - Line:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise Rejection:', event.reason);
});

// Test 7: Performance Check
console.log('\n7. Performance Check:');
if (window.performance && window.performance.timing) {
  const timing = window.performance.timing;
  const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
  console.log('   - Page load time:', pageLoadTime + 'ms');
  console.log('   - Performance:', pageLoadTime < 3000 ? '✅ Good' : '⚠️ Slow');
}

// Final Summary
setTimeout(() => {
  console.log('\n================================================');
  console.log('🎯 Production Test Summary:');
  console.log('');
  console.log('Next Steps:');
  console.log('1. If authenticated, navigate to /messages');
  console.log('2. Try clicking on a conversation');
  console.log('3. Test sending a message');
  console.log('4. Verify message appears after page refresh');
  console.log('');
  console.log('✅ If no errors above, production deployment should work!');
}, 3000);

// Export test function for manual triggering
window.testInteractiveMessages = function() {
  console.log('🧪 Manual test: Checking for conversation cards...');
  const cards = document.querySelectorAll('.cursor-pointer, [onclick]');
  console.log('Clickable elements found:', cards.length);

  if (cards.length > 0) {
    console.log('Try clicking on a conversation card to test the dialog!');
  } else {
    console.log('Navigate to /messages to test conversations');
  }
};
