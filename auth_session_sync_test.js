// Authentication Session Sync Verification Test
// Run this in the browser console after logging in

console.log("🔧 Authentication Session Sync Test");
console.log("===================================");

// Check for authentication cookies
function checkAuthCookies() {
    const cookies = document.cookie.split(';');
    const authCookies = cookies.filter(cookie => 
        cookie.trim().includes('sb-') && 
        cookie.trim().includes('auth-token')
    );
    
    console.log("🍪 Authentication Cookies:");
    if (authCookies.length > 0) {
        console.log("✅ Auth cookies found:", authCookies.length);
        authCookies.forEach(cookie => {
            const name = cookie.trim().split('=')[0];
            console.log(`   - ${name}: present`);
        });
    } else {
        console.log("❌ No authentication cookies found");
    }
    
    return authCookies.length > 0;
}

// Check localStorage for session data
function checkLocalStorage() {
    console.log("\n💾 Local Storage Check:");
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(key => key.includes('supabase'));
    
    if (supabaseKeys.length > 0) {
        console.log("✅ Supabase keys in localStorage:", supabaseKeys.length);
        supabaseKeys.forEach(key => {
            console.log(`   - ${key}: present`);
        });
    } else {
        console.log("ℹ️ No Supabase keys in localStorage");
    }
}

// Check authentication state in React context
function checkAuthContext() {
    console.log("\n👤 Authentication Context:");
    
    // Look for auth provider in React dev tools
    const authContext = window.React?.context || 'Not available in console';
    console.log("   React Auth Context:", typeof authContext);
    
    // Check if user data is available in DOM
    const profileElements = document.querySelectorAll('[data-testid*="profile"], [class*="profile"]');
    if (profileElements.length > 0) {
        console.log("✅ Profile elements found on page");
    }
    
    // Check for demo user indicators
    const demoIndicators = document.body.innerText.toLowerCase().includes('demo user');
    if (demoIndicators) {
        console.log("⚠️ 'Demo User' text found - may indicate fallback mode");
    } else {
        console.log("✅ No 'Demo User' text found");
    }
}

// Check current page authentication
function checkPageAuth() {
    console.log("\n📄 Current Page Authentication:");
    console.log("   URL:", window.location.pathname);
    
    // Check for authentication-related elements
    const loginButton = document.querySelector('[href*="login"], button[type="button"]:contains("Sign")');
    const profileLink = document.querySelector('[href*="profile"]');
    
    if (loginButton && loginButton.textContent.toLowerCase().includes('sign in')) {
        console.log("⚠️ Sign in button visible - user may not be authenticated");
    } else {
        console.log("✅ No sign in button visible");
    }
    
    if (profileLink) {
        console.log("✅ Profile link available");
    }
}

// Run all checks
async function runAuthTests() {
    console.log("Starting authentication verification...\n");
    
    const hasCookies = checkAuthCookies();
    checkLocalStorage();
    checkAuthContext();
    checkPageAuth();
    
    console.log("\n📊 Summary:");
    console.log("   Cookies present:", hasCookies ? "✅ YES" : "❌ NO");
    console.log("   Current URL:", window.location.href);
    console.log("   Timestamp:", new Date().toISOString());
    
    console.log("\n🔄 To test session persistence:");
    console.log("   1. Refresh this page");
    console.log("   2. Navigate to /profile");
    console.log("   3. Open a new tab to the same site");
    console.log("   4. Check that you remain logged in");
}

// Auto-run the test
runAuthTests();

// Export functions for manual testing
window.authTest = {
    runAuthTests,
    checkAuthCookies,
    checkLocalStorage,
    checkAuthContext,
    checkPageAuth
};

console.log("\n💡 Functions available:");
console.log("   authTest.runAuthTests() - Run all tests");
console.log("   authTest.checkAuthCookies() - Check cookies only");
console.log("   authTest.checkAuthContext() - Check React context");
