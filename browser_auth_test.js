// Enhanced browser test script to verify authentication persistence
// Run this in browser console after logging in

console.log("=== Enhanced Authentication Persistence Test ===");

// Check localStorage for session data
const checkLocalStorage = () => {
  console.log("\n1. Checking localStorage for session data:");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth'))) {
      const value = localStorage.getItem(key);
      console.log(`  ${key}:`, value ? "Present" : "Empty");
      if (value && key.includes('auth-token')) {
        try {
          const parsed = JSON.parse(value);
          console.log(`    User: ${parsed.user?.email || 'Unknown'}`);
          console.log(`    Expires: ${parsed.expires_at ? new Date(parsed.expires_at * 1000).toLocaleString() : 'Unknown'}`);
        } catch (e) {
          console.log(`    Could not parse session data`);
        }
      }
    }
  }
};

// Check cookies
const checkCookies = () => {
  console.log("\n2. Checking cookies:");
  const cookies = document.cookie.split(';').map(c => c.trim());
  const authCookies = cookies.filter(c => c.includes('auth') || c.includes('supabase'));
  if (authCookies.length > 0) {
    authCookies.forEach(cookie => {
      const [name, value] = cookie.split('=');
      console.log(`  ${name}: ${value ? 'Present' : 'Empty'}`);
    });
  } else {
    console.log("  No auth-related cookies found");
  }
};

// Test session sync endpoint
const testSessionSync = async () => {
  console.log("\n3. Testing session sync endpoint:");
  try {
    const response = await fetch('/auth/sync-session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("  ✅ Session sync successful");
      console.log("  User:", data.user?.email);
      console.log("  Expires at:", new Date(data.expires_at * 1000).toLocaleString());
      console.log("  Time until expiry:", Math.round((data.expires_at * 1000 - Date.now()) / 1000 / 60), "minutes");
    } else {
      const error = await response.json();
      console.log("  ❌ Session sync failed:", error.error);
      console.log("  Details:", error.details);
    }
  } catch (error) {
    console.log("  ❌ Session sync error:", error.message);
  }
};

// Test current auth context
const testAuthContext = () => {
  console.log("\n4. Testing current auth context:");

  // Check if we can access React context (this may not work in console)
  const authProviderDiv = document.querySelector('[data-auth-provider]');
  if (authProviderDiv) {
    console.log("  ✅ AuthProvider element found");
  } else {
    console.log("  ❓ AuthProvider element not found (normal if not marked)");
  }

  // Check for user info in DOM
  const userEmailElements = document.querySelectorAll('[data-testid*="user"], [data-testid*="email"]');
  if (userEmailElements.length > 0) {
    console.log("  ✅ User elements found in DOM");
  } else {
    console.log("  ❓ No user elements found in DOM");
  }
};

// Test hot reload resilience
const testHotReloadResilience = () => {
  console.log("\n5. Hot reload resilience test:");
  console.log("  To test: Make a small change to a component and save");
  console.log("  Expected: Session should persist after hot reload");
  console.log("  You can re-run this test after hot reload to verify");
};

// Navigation test
const testNavigation = () => {
  console.log("\n6. Navigation persistence test:");
  console.log("  Current URL:", window.location.pathname);
  console.log("  To test: Navigate to different pages and verify auth persists");
  console.log("  Test pages: /profile, /credits, /sessions");
};

// Run all tests
const runTests = async () => {
  checkLocalStorage();
  checkCookies();
  await testSessionSync();
  testAuthContext();
  testHotReloadResilience();
  testNavigation();

  console.log("\n=== Test Complete ===");
  console.log("✅ If session sync works and localStorage has data, authentication should persist!");
  console.log("🔄 To test hot reload resilience: make a small change and save a file");
  console.log("🔄 To test navigation: visit /profile, /credits, or /sessions");

  // Auto-rerun in 30 seconds for monitoring
  setTimeout(() => {
    console.log("\n=== Auto Re-test (30s later) ===");
    runTests();
  }, 30000);
};

// Auto-run tests
runTests();
