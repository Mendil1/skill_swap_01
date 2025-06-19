/**
 * Production Authentication Configuration Guide
 * This file helps diagnose and fix production authentication issues
 */

// Step 1: Supabase Dashboard Configuration
export const SUPABASE_DASHBOARD_CHECKLIST = {
  // 1. Site URL Configuration (Settings → Authentication)
  siteUrl: {
    development: "http://localhost:3000",
    production: "https://your-production-domain.com", // Replace with your actual domain
    staging: "https://your-staging-domain.com", // If you have staging
  },

  // 2. Redirect URLs (Settings → Authentication → Redirect URLs)
  redirectUrls: [
    "http://localhost:3000/**",
    "https://your-production-domain.com/**", // Replace with your actual domain
    "https://your-staging-domain.com/**", // If you have staging
  ],

  // 3. CORS Origins (Settings → API)
  corsOrigins: [
    "http://localhost:3000",
    "https://your-production-domain.com", // Replace with your actual domain
    "https://your-staging-domain.com", // If you have staging
  ],

  // 4. Auth Providers (Authentication → Providers)
  authProviders: {
    email: "Should be enabled",
    phone: "Optional - enable if using SMS",
    google: "Enable if using Google OAuth",
    github: "Enable if using GitHub OAuth",
  },
};

// Step 2: Environment Variables for Production
export const PRODUCTION_ENV_TEMPLATE = `
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://sogwgxkxuuvvvjbqlcdo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# CRITICAL: Update this to your production domain
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com

# Optional but recommended for production
NEXT_PUBLIC_ENABLE_MESSAGING=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Security settings
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=https://your-production-domain.com
`;

// Step 3: Common Production Issues and Solutions
export const PRODUCTION_TROUBLESHOOTING = {
  "Redirected to login after successful authentication": {
    cause: "Site URL mismatch or cookie domain issues",
    solutions: [
      "Update Site URL in Supabase Dashboard to match production domain",
      "Add production domain to Redirect URLs",
      "Check cookie SameSite and Secure settings",
      "Verify CORS origins include production domain",
    ],
  },

  "Authentication works in dev but not production": {
    cause: "Environment variables or cookie security settings",
    solutions: [
      "Ensure NEXT_PUBLIC_SITE_URL matches production domain",
      "Verify all environment variables are set in production",
      "Check if cookies are being set with correct domain",
      "Ensure secure flag is set for HTTPS in production",
    ],
  },

  "Session not persisting between page refreshes": {
    cause: "Cookie storage or domain configuration issues",
    solutions: [
      "Check maxAge cookie settings",
      "Verify httpOnly is false for auth cookies",
      "Ensure SameSite is set to 'lax'",
      "Check domain attribute on cookies",
    ],
  },
};

// Step 4: Quick Diagnostic Function
export const diagnoseProd = () => {
  console.log("🔍 Production Authentication Diagnosis");
  console.log("=====================================");

  console.log("1. Environment Variables:");
  console.log(`   SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL || "❌ Not set"}`);
  console.log(`   SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set"}`);
  console.log(
    `   ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set"}`
  );

  console.log("\n2. Current Domain:");
  if (typeof window !== "undefined") {
    console.log(`   Current: ${window.location.origin}`);
    console.log(`   Expected: ${process.env.NEXT_PUBLIC_SITE_URL}`);
    console.log(
      `   Match: ${window.location.origin === process.env.NEXT_PUBLIC_SITE_URL ? "✅" : "❌"}`
    );
  }

  console.log("\n3. Cookie Settings:");
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    const authCookies = cookies.filter(
      (cookie) => cookie.includes("supabase") || cookie.includes("sb-")
    );
    console.log(`   Auth cookies found: ${authCookies.length}`);
    authCookies.forEach((cookie) => console.log(`   - ${cookie.trim()}`));
  }
};

// Make available in browser console
if (typeof window !== "undefined") {
  (window as unknown as { diagnoseProd: typeof diagnoseProd }).diagnoseProd = diagnoseProd;
}
