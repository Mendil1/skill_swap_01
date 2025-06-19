// Production Authentication Test Script
// This script tests the complete authentication flow in production

const testAuthFlow = async () => {
  console.log("🔐 Testing Production Authentication Flow...");
  console.log("================================================");

  const baseUrl = "http://localhost:3000";
  const credentials = {
    email: "360z8@ptct.net",
    password: "000000",
  };

  try {
    // Test 1: Check if login page is accessible
    console.log("1. Testing login page accessibility...");
    const loginResponse = await fetch(`${baseUrl}/login`);
    console.log(`✅ Login page status: ${loginResponse.status}`);

    // Test 2: Check debug page before login
    console.log("\n2. Checking auth state before login...");
    const debugResponse = await fetch(`${baseUrl}/auth-debug-production`);
    console.log(`✅ Debug page status: ${debugResponse.status}`);

    // Test 3: Attempt login via API
    console.log("\n3. Testing login API...");
    const loginData = new FormData();
    loginData.append("email", credentials.email);
    loginData.append("password", credentials.password);

    const loginApiResponse = await fetch(`${baseUrl}/login`, {
      method: "POST",
      body: loginData,
      redirect: "manual", // Don't follow redirects automatically
    });

    console.log(`Login API response status: ${loginApiResponse.status}`);
    console.log(
      `Login API response headers:`,
      Object.fromEntries(loginApiResponse.headers.entries())
    );

    // Test 4: Check if cookies are set
    const cookies = loginApiResponse.headers.get("set-cookie");
    console.log(`Cookies set: ${cookies ? "YES" : "NO"}`);
    if (cookies) {
      console.log(`Cookie details: ${cookies}`);
    }

    // Test 5: Test protected route access
    console.log("\n4. Testing protected route access...");
    const profileResponse = await fetch(`${baseUrl}/profile`, {
      headers: cookies ? { Cookie: cookies } : {},
    });
    console.log(`Profile page status: ${profileResponse.status}`);

    console.log("\n================================================");
    console.log("🏁 Test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Alternative browser-based test
const browserTest = () => {
  const baseUrl = "http://localhost:3000";
  console.log("🌐 Browser-based Authentication Test");
  console.log("====================================");

  // Instructions for manual testing
  console.log(`
📋 Manual Testing Steps:
1. Open: ${baseUrl}/login
2. Enter email: 360z8@ptct.net
3. Enter password: 000000
4. Click Login
5. Check if redirected to dashboard/profile
6. Refresh page - should stay logged in
7. Visit: ${baseUrl}/auth-debug-production to see auth state
8. Visit: ${baseUrl}/profile to test protected route

🔍 What to look for:
- Login should redirect to dashboard/home
- User should remain logged in after refresh
- Auth cookies should be visible in DevTools
- Protected routes should be accessible
- No authentication errors in console
  `);
};

// Run the test
testAuthFlow();
browserTest();
