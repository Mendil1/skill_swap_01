#!/bin/bash

echo "🔧 Authentication Flow Test - After Client-Server Sync Fix"
echo "========================================================="

echo "🎯 Testing authentication persistence for Mike (360z8@ptct.net)"
echo ""

# Navigate to project directory
cd "c:/Users/Mendi/DEV_PFE/skill-swap-01"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🚀 Starting production server..."
echo "  Navigate to: http://localhost:3000"
echo ""

# Start the server in background
npm run start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

echo ""
echo "🧪 TESTING INSTRUCTIONS:"
echo "========================"
echo ""
echo "1. 🌐 Open your browser to: http://localhost:3000"
echo ""
echo "2. 🔐 Login with Mike's credentials:"
echo "   📧 Email: 360z8@ptct.net"
echo "   🔑 Password: 000000"
echo ""
echo "3. 📋 Check browser console for these logs:"
echo "   ✅ [AuthProvider] Getting initial session..."
echo "   ✅ [AuthProvider] getSession() result: { hasSession: false/true, ... }"
echo "   ✅ [AuthProvider] getUser() result: { hasUser: true, userEmail: '360z8@ptct.net' }"
echo "   ✅ [AuthProvider] Server validated user, setting auth state..."
echo ""
echo "4. 👤 Navigate to /profile page and verify:"
echo "   ✅ Shows 'Loading profile...' briefly"
echo "   ✅ Then shows real user data (NOT 'Demo User')"
echo "   ✅ Email displays as: 360z8@ptct.net"
echo "   ❌ NO 'Profile not found' error"
echo ""
echo "5. 🔄 Test session persistence:"
echo "   📄 Refresh the page → Should stay logged in"
echo "   🆕 Open new tab → Should maintain session"
echo "   🧭 Navigate between pages → No re-login prompts"
echo ""
echo "6. 🏠 Expected behavior on all pages:"
echo "   /sessions → Shows sessions without authentication prompt"
echo "   /messages → Maintains authenticated state"
echo "   /credits → Shows user-specific credit information"
echo ""

echo "📊 EXPECTED CONSOLE OUTPUT:"
echo "==========================="
echo "[AuthProvider] Getting initial session..."
echo "[AuthProvider] getSession() result: { hasSession: false, error: undefined }"
echo "[AuthProvider] No session in storage, checking with server..."
echo "[AuthProvider] getUser() result: { hasUser: true, userEmail: '360z8@ptct.net' }"
echo "[AuthProvider] Server validated user, setting auth state..."
echo "[Profile] Auth context - user: 360z8@ptct.net authLoading: false"
echo ""

echo "🆘 TROUBLESHOOTING:"
echo "==================="
echo "If profile still shows 'Demo User':"
echo "1. Clear browser cache and localStorage"
echo "2. Open browser dev tools → Application → Storage → Clear All"
echo "3. Try logging in again"
echo ""
echo "If authentication logs don't appear:"
echo "1. Check browser console for errors"
echo "2. Verify network tab shows successful auth requests"
echo "3. Check server terminal for auth cookie logs"
echo ""

echo "Press Ctrl+C to stop the server when testing is complete"
echo ""
echo "🎯 SUCCESS CRITERIA:"
echo "✅ Profile page shows real user data for 360z8@ptct.net"
echo "✅ No repeated login prompts"
echo "✅ Session persists across page navigation"
echo "✅ AuthProvider logs show successful user detection"

# Keep the script running and the server alive
wait $SERVER_PID
