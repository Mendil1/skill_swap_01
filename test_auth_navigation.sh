#!/bin/bash
echo "Testing Authentication-Aware Navigation"
echo "======================================="

echo "1. Starting development server..."
cd "c:/Users/Mendi/DEV_PFE/skill-swap-01"
npm run dev &
SERVER_PID=$!

echo "2. Waiting for server to start..."
sleep 10

echo "3. Server should be running at http://localhost:3000"
echo "4. Testing points:"
echo "   - Visit http://localhost:3000 in private/incognito browser"
echo "   - Header should show: Home, Explore Skills, How It Works, Sessions, Sign In"
echo "   - Header should NOT show: Messages, Credits, Profile"
echo "   - Footer should show: Sign In, Create Account (no Profile/Messages/Credits)"
echo "   - After login, header should show: Home, Explore Skills, How It Works, Sessions, Messages, Credits, Profile, Sign Out"
echo "   - After login, footer should show: My Profile, Messages, Credits, Sign Out"
echo ""
echo "5. To stop the server, run: kill $SERVER_PID"
echo "Server PID: $SERVER_PID"
