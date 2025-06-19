// Quick verification of authentication fix
// Run this in browser console after implementing fixes

console.log("🔍 Authentication Fix Verification");
console.log("==================================");

// 1. Check localStorage for Supabase session
function checkLocalStorageSession() {
    console.log("\n📱 LocalStorage Session Check:");
    const keys = Object.keys(localStorage).filter(key => key.includes('supabase'));

    if (keys.length > 0) {
        console.log("✅ Supabase keys found in localStorage:", keys.length);
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    const parsed = JSON.parse(value);
                    if (parsed.access_token) {
                        console.log(`   📱 ${key}: Has access_token`);
                    } else {
                        console.log(`   📱 ${key}: No access_token`);
                    }
                } catch {
                    console.log(`   📱 ${key}: Not JSON`);
                }
            }
        });
    } else {
        console.log("❌ No Supabase session in localStorage");
    }

    return keys.length > 0;
}

// 2. Check if auth provider is working
function checkAuthProvider() {
    console.log("\n👤 Auth Provider State:");

    // Try to find auth context in React
    const authElements = document.querySelectorAll('[data-testid*="auth"], [class*="auth"]');
    console.log("   🔍 Auth elements found:", authElements.length);

    // Check for loading indicators
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
    console.log("   ⏳ Loading elements:", loadingElements.length);

    // Check for user-specific content
    const userElements = document.body.innerText.includes('360z8@ptct.net');
    console.log("   📧 User email visible:", userElements ? "YES" : "NO");

    // Check for demo user
    const demoUser = document.body.innerText.toLowerCase().includes('demo user');
    console.log("   👤 Demo user mode:", demoUser ? "YES (BAD)" : "NO (GOOD)");
}

// 3. Test Supabase client
async function testSupabaseClient() {
    console.log("\n🔗 Supabase Client Test:");

    try {
        // This should work if the fix is applied correctly
        if (typeof window.supabase !== 'undefined') {
            console.log("   ✅ Global supabase client available");

            const { data: { session } } = await window.supabase.auth.getSession();
            console.log("   📋 Session:", session ? "Found" : "Not found");

            if (session) {
                console.log("   📧 Session user:", session.user?.email);
            }
        } else {
            console.log("   ℹ️ Global supabase client not available (normal)");
        }

        // Check for auth cookies (should be NO for httpOnly cookies)
        const authCookies = document.cookie.split(';').filter(c => c.includes('sb-'));
        console.log("   🍪 Client-readable auth cookies:", authCookies.length);

    } catch (error) {
        console.log("   ❌ Supabase client error:", error.message);
    }
}

// 4. Check current page state
function checkPageState() {
    console.log("\n📄 Current Page State:");
    console.log("   🌐 URL:", window.location.pathname);

    // Check for profile page specifics
    if (window.location.pathname === '/profile') {
        const profileLoading = document.body.innerText.includes('Loading profile');
        const profileError = document.body.innerText.includes('Profile not found');

        console.log("   ⏳ Profile loading text:", profileLoading ? "YES" : "NO");
        console.log("   ❌ Profile error text:", profileError ? "YES (BAD)" : "NO (GOOD)");
    }

    // Check for sign in button
    const signInButton = document.querySelector('button, a')?.textContent?.toLowerCase().includes('sign in');
    console.log("   🔑 Sign in button visible:", signInButton ? "YES (not logged in)" : "NO (logged in)");
}

// Run all checks
async function runAllChecks() {
    const hasLocalStorage = checkLocalStorageSession();
    checkAuthProvider();
    await testSupabaseClient();
    checkPageState();

    console.log("\n📊 SUMMARY:");
    console.log("   LocalStorage session:", hasLocalStorage ? "✅ YES" : "❌ NO");
    console.log("   Current URL:", window.location.pathname);
    console.log("   Timestamp:", new Date().toISOString());

    console.log("\n💡 NEXT STEPS:");
    if (window.location.pathname !== '/profile') {
        console.log("   1. Navigate to /profile to test the fix");
    }
    console.log("   2. Check console for [AuthProvider] logs");
    console.log("   3. Verify user email shows as 360z8@ptct.net");
    console.log("   4. Confirm no 'Demo User' text appears");
}

// Auto-run
runAllChecks();

// Export for manual use
window.authVerify = {
    runAllChecks,
    checkLocalStorageSession,
    checkAuthProvider,
    testSupabaseClient,
    checkPageState
};
