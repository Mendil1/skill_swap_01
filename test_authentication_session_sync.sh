#!/bin/bash

echo "🔧 Authentication Session Sync Fix Test"
echo "========================================"

echo "📋 Testing authentication persistence for Mike (360z8@ptct.net)"
echo ""

# Start the application
echo "🚀 Starting the application..."
cd "c:/Users/Mendi/DEV_PFE/skill-swap-01"

# Check if build is successful
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Start the production server
echo "🌐 Starting production server..."
npm run start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

echo ""
echo "🧪 Manual Testing Instructions:"
echo "1. Open browser to http://localhost:3000"
echo "2. Login with Mike's credentials:"
echo "   Email: 360z8@ptct.net"
echo "   Password: 000000"
echo ""
echo "3. Check console for authentication logs:"
echo "   - [Client] Auth cookies found: YES"
echo "   - [AuthProvider] Found session for user: 360z8@ptct.net"
echo "   - [Supabase Server] sb- cookies found"
echo ""
echo "4. Navigate to /profile page and verify:"
echo "   - Shows real user data (not Demo User)"
echo "   - Email displays as 360z8@ptct.net"
echo "   - No 'Profile not found' error"
echo ""
echo "5. Test persistence by:"
echo "   - Refreshing the page (should stay logged in)"
echo "   - Opening new tab (should maintain session)"
echo "   - Navigating between pages (no re-login prompts)"
echo ""
echo "Press Ctrl+C to stop the server when testing is complete"

# Keep the script running
wait $SERVER_PID
