// Test script to verify notification bell functionality
// Run this in the browser console when logged in

console.log("🔔 NOTIFICATION BELL TEST STARTED");

// Test 1: Check if notification bell exists and is clickable
function testNotificationBellExists() {
  console.log("\n📍 Test 1: Checking if notification bell exists...");

  const bellButton = document.querySelector('[aria-label="Notifications"]');
  const bellIcon = document.querySelector('svg[data-lucide="bell"]');

  if (bellButton || bellIcon) {
    console.log("✅ Notification bell found in DOM");
    return true;
  } else {
    console.log("❌ Notification bell NOT found in DOM");
    return false;
  }
}

// Test 2: Test bell click functionality
function testBellClick() {
  console.log("\n📍 Test 2: Testing bell click functionality...");

  const bellButton = document.querySelector('[aria-label="Notifications"]') ||
                    document.querySelector('button:has(svg[data-lucide="bell"])');

  if (!bellButton) {
    console.log("❌ Cannot find bell button for click test");
    return false;
  }

  console.log("🖱️ Simulating bell click...");
  bellButton.click();

  // Wait a moment and check if popover opened
  setTimeout(() => {
    const popover = document.querySelector('[data-radix-popper-content-wrapper]') ||
                   document.querySelector('[role="dialog"]') ||
                   document.querySelector('.notifications-popover');

    if (popover) {
      console.log("✅ Notification popover opened successfully!");
      console.log("📋 Popover content:", popover.innerHTML.slice(0, 200) + "...");
    } else {
      console.log("❌ Notification popover did NOT open");
      console.log("🔍 Looking for any visible dropdowns...");
      const anyDropdown = document.querySelector('[data-state="open"]');
      if (anyDropdown) {
        console.log("📋 Found open dropdown:", anyDropdown);
      }
    }
  }, 1000);

  return true;
}

// Test 3: Check notification count badge
function testNotificationBadge() {
  console.log("\n📍 Test 3: Checking notification count badge...");

  const badge = document.querySelector('.absolute.-top-2.-right-2') ||
               document.querySelector('[class*="badge"]');

  if (badge) {
    console.log("✅ Notification badge found:", badge.textContent);
  } else {
    console.log("ℹ️ No notification badge visible (this is normal if no unread notifications)");
  }
}

// Test 4: Check for JavaScript errors
function testForErrors() {
  console.log("\n📍 Test 4: Checking for JavaScript errors...");

  // Listen for any errors during testing
  window.addEventListener('error', (e) => {
    console.log("❌ JavaScript error detected:", e.error);
  });

  console.log("✅ Error listener attached");
}

// Test 5: Check network requests when bell is clicked
function testNetworkRequests() {
  console.log("\n📍 Test 5: Monitoring network requests...");

  // Override fetch to monitor API calls
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    if (args[0] && args[0].includes('/api/notifications')) {
      console.log("🌐 Notification API call detected:", args[0]);
    }
    return originalFetch.apply(this, args);
  };

  console.log("✅ Network monitoring active");
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Running all notification bell tests...\n");

  testForErrors();
  testNetworkRequests();

  if (testNotificationBellExists()) {
    testNotificationBadge();
    testBellClick();
  }

  console.log("\n✨ Test completed! Check the console for results.");
  console.log("💡 To test manually: Click the bell icon in the top navigation bar.");
}

// Auto-run tests
runAllTests();
