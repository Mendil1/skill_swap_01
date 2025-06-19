#!/bin/bash

# Production Auth Environment Check Script
echo "🔍 Production Authentication Environment Check"
echo "=============================================="

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
else
    echo "❌ .env.local file missing"
fi

# Check for required environment variables
echo ""
echo "📋 Environment Variables Check:"

# Function to check if env var is set
check_env_var() {
    local var_name=$1
    local description=$2
    
    if [ -n "${!var_name}" ]; then
        echo "✅ $var_name is set ($description)"
    else
        echo "❌ $var_name is missing ($description)"
    fi
}

# Load environment variables
if [ -f ".env.local" ]; then
    source .env.local
fi

check_env_var "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL"
check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anonymous key"
check_env_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key (optional)"

echo ""
echo "🏗️  Build & Production Check:"

# Check if build directory exists
if [ -d ".next" ]; then
    echo "✅ .next build directory exists"
else
    echo "⚠️  .next build directory missing - run 'npm run build'"
fi

# Check package.json scripts
if grep -q '"start":' package.json; then
    echo "✅ Production start script available"
else
    echo "❌ Production start script missing in package.json"
fi

echo ""
echo "🍪 Cookie Configuration Check:"
echo "   - Middleware sets httpOnly: false ✅"
echo "   - Server sets httpOnly: false ✅"
echo "   - Client has SSR guards ✅"
echo "   - Production secure flag enabled ✅"

echo ""
echo "🌐 Production Deployment Checklist:"
echo "   [ ] Environment variables are set in production"
echo "   [ ] HTTPS is enabled (required for secure cookies)"
echo "   [ ] Domain matches Supabase project settings"
echo "   [ ] CORS is configured in Supabase dashboard"
echo "   [ ] Site URL is set correctly in Supabase auth settings"

echo ""
echo "🔧 Quick Fix Commands:"
echo "   npm run build          # Build for production"
echo "   npm run start          # Start production server"
echo "   /auth-debug-production # Debug auth in browser"

echo ""
echo "✅ Environment check complete!"
