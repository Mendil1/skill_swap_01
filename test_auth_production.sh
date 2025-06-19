#!/bin/bash

# Production Authentication Test Script
# Run this script to start the production server and verify authentication fixes

echo "🚀 Starting SkillSwap Production Authentication Test"
echo "=================================================="

# Check if build exists
if [ ! -d ".next" ]; then
    echo "❌ No build found. Running build first..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please fix build errors first."
        exit 1
    fi
fi

echo "✅ Build found"

# Start production server
echo "🌐 Starting production server..."
echo ""
echo "📋 Test Checklist:"
echo "=================="
echo "1. Open incognito/private browser"
echo "2. Navigate to http://localhost:3000"
echo "3. Verify 'View Profile' is NOT visible"
echo "4. Click 'Sign In' and log in"
echo "5. After login, verify 'View Profile' IS visible"
echo "6. Click 'View Profile' - should go to profile page"
echo "7. Navigate to Messages, Credits - should work seamlessly"
echo "8. No redirects to homepage should occur"
echo ""
echo "🎯 Expected Results:"
echo "- No login loops"
echo "- Proper returnUrl handling"
echo "- Seamless navigation post-login"
echo "- User data loads correctly"
echo ""
echo "Press Ctrl+C to stop the server when testing is complete"
echo ""

npm start
