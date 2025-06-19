#!/bin/bash

echo "🔍 Authentication Implementation Diagnostic"
echo "=========================================="
echo ""

echo "📁 Checking key authentication files..."
echo ""

# Check auth provider
if [ -f "src/components/auth-provider.tsx" ]; then
    echo "✅ auth-provider.tsx exists"
    echo "   Size: $(wc -l < src/components/auth-provider.tsx) lines"
    if grep -q "useAuth" src/components/auth-provider.tsx; then
        echo "   ✅ Exports useAuth hook"
    fi
    if grep -q "onAuthStateChange" src/components/auth-provider.tsx; then
        echo "   ✅ Uses onAuthStateChange"
    fi
    if grep -q "createClient" src/components/auth-provider.tsx; then
        echo "   ✅ Uses Supabase client"
    fi
else
    echo "❌ auth-provider.tsx NOT FOUND"
fi

echo ""

# Check navigation header
if [ -f "src/components/navigation-header.tsx" ]; then
    echo "✅ navigation-header.tsx exists"
    if grep -q "useAuth" src/components/navigation-header.tsx; then
        echo "   ✅ Uses useAuth hook"
    fi
    if grep -q "user &&" src/components/navigation-header.tsx; then
        echo "   ✅ Has conditional rendering for user links"
    fi
    if grep -q "!loading" src/components/navigation-header.tsx; then
        echo "   ✅ Checks loading state"
    fi
else
    echo "❌ navigation-header.tsx NOT FOUND"
fi

echo ""

# Check protected pages
echo "📄 Checking protected pages..."
for page in "profile" "credits" "messages"; do
    if [ -f "src/app/${page}/page-hybrid.tsx" ]; then
        echo "✅ ${page}/page-hybrid.tsx exists"
        if grep -q "useAuth" "src/app/${page}/page-hybrid.tsx"; then
            echo "   ✅ Uses useAuth hook"
        fi
        if grep -q "router.push.*login" "src/app/${page}/page-hybrid.tsx"; then
            echo "   ✅ Redirects to login when unauthenticated"
        fi
    else
        echo "❌ ${page}/page-hybrid.tsx NOT FOUND"
    fi
done

echo ""

# Check layout
if [ -f "src/app/layout.tsx" ]; then
    echo "✅ layout.tsx exists"
    if grep -q "AuthProvider" src/app/layout.tsx; then
        echo "   ✅ Uses AuthProvider"
    fi
else
    echo "❌ layout.tsx NOT FOUND"
fi

echo ""

# Check for removed files (should not exist)
echo "🗑️  Checking for removed/old files..."
old_files=("src/components/client-layout.tsx" "src/app/layout-new.tsx" "src/app/layout-old.tsx")
for file in "${old_files[@]}"; do
    if [ -f "$file" ]; then
        echo "⚠️  $file still exists (should be removed)"
    else
        echo "✅ $file properly removed"
    fi
done

echo ""

# Check environment
echo "🌍 Environment check..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "   ✅ Has NEXT_PUBLIC_SUPABASE_URL"
    fi
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "   ✅ Has NEXT_PUBLIC_SUPABASE_ANON_KEY"
    fi
else
    echo "❌ .env.local NOT FOUND"
fi

echo ""

# Build check
echo "🏗️  Build status..."
if [ -d ".next" ]; then
    echo "✅ .next directory exists (build has been run)"
    if [ -f ".next/server/app/layout.js" ]; then
        echo "   ✅ Layout compiled successfully"
    fi
else
    echo "⚠️  .next directory not found (need to run build)"
fi

echo ""
echo "🎯 Quick Fix Commands:"
echo "   Build: npm run build"
echo "   Start: npm start"
echo "   Dev:   npm run dev"
echo ""
echo "📝 Test URL: http://localhost:3000"
echo "📋 Test Guide: PRODUCTION_AUTH_TEST_GUIDE.md"
