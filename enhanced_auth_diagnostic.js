// Enhanced Authentication Diagnostic Script
// Paste this into browser console after login to diagnose the issue

console.log("🔧 Enhanced Authentication Diagnostic");
console.log("=====================================");

async function runEnhancedDiagnostic() {
    console.log("\n🔍 1. BROWSER ENVIRONMENT CHECK");
    console.log("   Current URL:", window.location.href);
    console.log("   User Agent:", navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other');
    console.log("   LocalStorage available:", typeof Storage !== 'undefined');

    console.log("\n🍪 2. COOKIE ANALYSIS");
    const allCookies = document.cookie.split(';');
    const sbCookies = allCookies.filter(c => c.includes('sb-'));
    console.log("   Total cookies:", allCookies.length);
    console.log("   Supabase cookies (client-readable):", sbCookies.length);

    if (sbCookies.length > 0) {
        sbCookies.forEach(cookie => {
            const name = cookie.trim().split('=')[0];
            console.log("   📱", name);
        });
    } else {
        console.log("   ❌ No client-readable Supabase cookies (expected for httpOnly)");
    }

    console.log("\n💾 3. LOCALSTORAGE ANALYSIS");
    const lsKeys = Object.keys(localStorage);
    const supabaseKeys = lsKeys.filter(key => key.includes('supabase'));
    console.log("   LocalStorage keys:", lsKeys.length);
    console.log("   Supabase keys:", supabaseKeys.length);

    supabaseKeys.forEach(key => {
        const value = localStorage.getItem(key);
        try {
            const parsed = JSON.parse(value);
            const hasToken = parsed.access_token ? 'YES' : 'NO';
            console.log(`   📱 ${key}: access_token=${hasToken}`);
        } catch {
            console.log(`   📱 ${key}: (not JSON)`);
        }
    });

    console.log("\n🔗 4. SUPABASE CLIENT TEST");
    try {
        // Create a fresh Supabase client for testing
        const testClient = window.createBrowserClient ? window.createBrowserClient() : null;
        if (!testClient) {
            console.log("   ❌ Cannot create test client");
            return;
        }

        console.log("   ✅ Test client created");

        // Test getSession
        const { data: sessionData, error: sessionError } = await testClient.auth.getSession();
        console.log("   📋 getSession():", {
            hasSession: !!sessionData.session,
            userEmail: sessionData.session?.user?.email,
            error: sessionError?.message
        });

        // Test getUser
        const { data: userData, error: userError } = await testClient.auth.getUser();
        console.log("   👤 getUser():", {
            hasUser: !!userData.user,
            userEmail: userData.user?.email,
            error: userError?.message
        });

    } catch (error) {
        console.log("   ❌ Supabase test error:", error.message);
    }

    console.log("\n🎭 5. REACT COMPONENT CHECK");
    const authElements = document.querySelectorAll('[data-testid*="auth"], [class*="auth"]');
    const userEmail = document.body.innerText.includes('360z8@ptct.net');
    const demoUser = document.body.innerText.toLowerCase().includes('demo user');

    console.log("   Auth elements found:", authElements.length);
    console.log("   User email visible:", userEmail ? "✅ YES" : "❌ NO");
    console.log("   Demo user text:", demoUser ? "❌ YES (bad)" : "✅ NO (good)");

    console.log("\n📊 6. SUMMARY & RECOMMENDATIONS");

    const hasLocalStorageSession = supabaseKeys.length > 0;
    const hasServerValidation = !userError && !!userData?.user;

    if (hasLocalStorageSession) {
        console.log("   ✅ LocalStorage session found - AuthProvider should work");
    } else if (hasServerValidation) {
        console.log("   ⚠️ Server validates user but no local session - sync issue");
        console.log("   💡 Recommendation: Try refreshing page or clearing storage");
    } else {
        console.log("   ❌ No authentication detected");
        console.log("   💡 Recommendation: Re-login with 360z8@ptct.net / 000000");
    }

    if (demoUser) {
        console.log("   ❌ Still showing Demo User");
        console.log("   💡 Next steps:");
        console.log("      1. Clear browser storage completely");
        console.log("      2. Re-login");
        console.log("      3. Check for JavaScript errors");
    }
}

// Auto-run the diagnostic
runEnhancedDiagnostic();

// Export for manual use
window.authDiagnostic = runEnhancedDiagnostic;
