#!/bin/bash
# Complete Session Implementation Script
# This script completes the session scheduling system implementation

echo "🚀 Starting Complete Session Implementation..."

# Step 1: Change to project directory
cd /c/Users/Mendi/DEV_PFE/skill-swap-01

# Step 2: Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Step 3: Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next

# Step 4: Start development server in background
echo "🌐 Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Step 5: Apply database schema fixes
echo "🔧 Applying database schema fixes..."
echo "Please visit http://localhost:3000/fix-sessions-schema and click 'Add Missing Status Columns'"

# Step 6: Test the sessions page
echo "🧪 Testing sessions page..."
echo "Please visit http://localhost:3000/sessions to test the implementation"

echo "✅ Setup complete! Manual steps required:"
echo "1. Visit http://localhost:3000/fix-sessions-schema"
echo "2. Click 'Add Missing Status Columns' button"
echo "3. Then click 'Apply All Schema Fixes' button"
echo "4. Visit http://localhost:3000/sessions to test"
echo "5. To stop the server later, run: kill $DEV_SERVER_PID"

# Keep script running
wait
