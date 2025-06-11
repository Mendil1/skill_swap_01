#!/bin/bash

echo "🔧 MESSAGING SYSTEM FIX & TEST"
echo "================================"

echo ""
echo "📋 Step 1: Installing dependencies..."
npm install

echo ""
echo "🧹 Step 2: Clearing cache..."
rm -rf .next
npm cache clean --force

echo ""
echo "🔍 Step 3: Checking component files..."

# Check if improved components exist
if [ -f "src/app/messages/components/improved-conversation-list.tsx" ]; then
    echo "✅ Improved conversation list component exists"
else
    echo "❌ Improved conversation list component missing"
fi

if [ -f "src/app/messages/components/improved-message-list.tsx" ]; then
    echo "✅ Improved message list component exists"
else
    echo "❌ Improved message list component missing"
fi

echo ""
echo "🔄 Step 4: Starting development server..."
echo "The server will start and open your browser automatically."
echo "Navigate to /messages to test the messaging system."
echo ""
echo "🎯 WHAT TO CHECK:"
echo "1. Do conversations load without errors?"
echo "2. Can you see old messages when clicking on a conversation?"
echo "3. Can you send new messages?"
echo "4. Check browser console for any errors"
echo ""
echo "Press Ctrl+C to stop the server when done testing."
echo ""

# Start the development server
npm run dev
