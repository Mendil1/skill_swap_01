#!/bin/bash

# Production Readiness Check for Interactive Messages Feature
echo "🔍 Checking Production Readiness for Interactive Messages..."
echo "=================================================="

# Check 1: Build Test
echo "1. Testing Production Build..."
npm run build > build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build Success: Application builds without errors"
else
    echo "❌ Build Failed: Check build.log for details"
    echo "Last few lines of build log:"
    tail -10 build.log
fi

# Check 2: Type Check
echo ""
echo "2. Running Type Check..."
npm run type-check > typecheck.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ TypeScript: No type errors found"
else
    echo "❌ TypeScript Errors: Check typecheck.log"
    echo "Type errors found:"
    tail -5 typecheck.log
fi

# Check 3: Lint Check
echo ""
echo "3. Running Lint Check..."
npm run lint > lint.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Linting: No linting errors"
else
    echo "⚠️ Linting Issues: Check lint.log (may not be critical)"
fi

# Check 4: Check for console.log statements (removed in production)
echo ""
echo "4. Checking for Console Statements..."
CONSOLE_COUNT=$(grep -r "console\." src/ --include="*.tsx" --include="*.ts" | grep -v "console.error\|console.warn" | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
    echo "⚠️ Found $CONSOLE_COUNT console.log statements (will be removed in production build)"
else
    echo "✅ No problematic console statements found"
fi

# Check 5: Environment Variables Check
echo ""
echo "5. Checking Environment Configuration..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local found"
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_URL configured"
    else
        echo "⚠️ NEXT_PUBLIC_SUPABASE_URL not in .env.local (using fallback)"
    fi
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configured"
    else
        echo "⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY not in .env.local (using fallback)"
    fi
else
    echo "⚠️ No .env.local file found (using hardcoded fallbacks)"
fi

# Check 6: Critical Files Exist
echo ""
echo "6. Checking Critical Files..."
CRITICAL_FILES=(
    "src/app/api/messages/route.ts"
    "src/components/conversation-dialog-fixed.tsx"
    "src/app/messages/page.tsx"
    "src/utils/supabase/server.ts"
    "src/utils/supabase/client.ts"
    "middleware.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check 7: Node.js Version
echo ""
echo "7. Checking Node.js Version..."
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"
if [[ "$NODE_VERSION" =~ ^v1[8-9]\.|^v[2-9][0-9]\. ]]; then
    echo "✅ Node.js version is compatible"
else
    echo "⚠️ Node.js version may be too old (recommended: 18+)"
fi

# Check 8: Package Dependencies
echo ""
echo "8. Checking Critical Dependencies..."
CRITICAL_DEPS=(
    "@supabase/ssr"
    "@supabase/supabase-js"
    "next"
    "react"
)

for dep in "${CRITICAL_DEPS[@]}"; do
    if npm list "$dep" > /dev/null 2>&1; then
        VERSION=$(npm list "$dep" --depth=0 2>/dev/null | grep "$dep" | cut -d@ -f2)
        echo "✅ $dep@$VERSION installed"
    else
        echo "❌ $dep not installed"
    fi
done

echo ""
echo "=================================================="
echo "🎯 Production Readiness Summary:"
echo ""

# Final recommendations
echo "📋 Pre-Production Checklist:"
echo ""
echo "Environment & Deployment:"
echo "□ Set NEXT_PUBLIC_SUPABASE_URL in production environment"
echo "□ Set NEXT_PUBLIC_SUPABASE_ANON_KEY in production environment"
echo "□ Verify Supabase project is accessible from production domain"
echo "□ Configure proper CORS settings in Supabase"
echo ""
echo "Database & Permissions:"
echo "□ Verify messages table exists with proper schema"
echo "□ Verify connection_requests table exists"
echo "□ Verify users table exists with required fields"
echo "□ Test RLS policies allow authenticated users to send/read messages"
echo ""
echo "API & Authentication:"
echo "□ Test /api/messages endpoint in production"
echo "□ Verify authentication cookies work across domains"
echo "□ Test message sending/receiving with real users"
echo "□ Verify middleware handles authentication properly"
echo ""
echo "Performance & Monitoring:"
echo "□ Monitor API response times"
echo "□ Set up error tracking for message failures"
echo "□ Test with multiple concurrent users"
echo "□ Verify page refresh after sending messages works"

echo ""
echo "✅ Run this script regularly to ensure production readiness!"
