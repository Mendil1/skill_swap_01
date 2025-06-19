#!/bin/bash

echo "🔍 Authentication Debug: Client-Server Session Sync"
echo "=================================================="

echo "📋 Current Issue Analysis:"
echo "- Server has auth cookies: sb-sogwgxkxuuvvvjbqlcdo-auth-token"
echo "- Client shows: Auth cookies found: NO"
echo "- AuthProvider logs: MISSING (not executing)"
echo "- Profile page: Falls back to mock data"
echo ""

echo "🔧 Debugging Steps:"
echo ""

echo "1. 🏗️ Building application..."
cd "/c/Users/Mendi/DEV_PFE/skill-swap-01"
npm run build

if [ $? -eq 0 ]; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed - check for compilation errors"
    exit 1
fi

echo ""
echo "2. 🚀 Starting production server (where issue occurs)..."
echo "   🌐 Server will be at: http://localhost:3000"
echo ""
echo "3. 🧪 Manual Test Instructions:"
echo "   a) Login with: 360z8@ptct.net / 000000"
echo "   b) Go to /profile page"
echo "   c) Open browser console and look for:"
echo "      - [AuthProvider] Component initialized"
echo "      - [AuthProvider] useEffect triggered"
echo "      - [AuthProvider] Getting initial session..."
echo ""
echo "4. 🔍 Expected Debug Output:"
echo "   ✅ [AuthProvider] Server validated user"
echo "   ✅ [Profile] Auth context - user: 360z8@ptct.net"
echo "   ✅ Profile shows real user data (not Demo User)"
echo ""
echo "5. ❌ If AuthProvider logs still missing:"
echo "   - Check for JavaScript errors in console"
echo "   - Verify AuthProvider is being rendered"
echo "   - Check React DevTools for component tree"
echo ""

echo "Starting server... (Press Ctrl+C to stop)"
npm run start
