#!/bin/bash

echo "🔄 Starting messaging system test..."

# Navigate to project directory
cd "C:\Users\Mendi\DEV_PFE\skill-swap-01"

# Check if there are any critical errors first
echo "🔍 Checking for critical errors..."
npm run build 2>&1 | head -20

echo ""
echo "🚀 Starting development server..."
echo "📍 Open your browser and go to: http://localhost:3000/messages"
echo "💡 Test with a conversation that has existing messages"
echo ""

# Start the dev server
npm run dev
