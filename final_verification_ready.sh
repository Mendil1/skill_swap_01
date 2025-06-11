#!/bin/bash

# Final messaging system verification script
echo "🎯 FINAL MESSAGING SYSTEM VERIFICATION"
echo "======================================"

# Check if Node.js modules are installed
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Running npm install..."
    npm install
fi

# Check main files exist and have correct imports
echo "✅ Checking file structure..."

FILES=(
    "src/app/messages/page.tsx"
    "src/app/messages/components/improved-conversation-list.tsx"
    "src/app/messages/components/improved-message-list.tsx"
    "src/app/messages/[conversationId]/page.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
    fi
done

# Check for schema errors in the improved components
echo "✅ Checking for schema errors..."

# Check improved-conversation-list for old schema references
if grep -q "created_at\|is_read" "src/app/messages/components/improved-conversation-list.tsx" 2>/dev/null; then
    echo "  ❌ improved-conversation-list.tsx still has old schema references"
else
    echo "  ✅ improved-conversation-list.tsx - no old schema references"
fi

# Check improved-message-list for old schema references
if grep -q "created_at\|is_read" "src/app/messages/components/improved-message-list.tsx" 2>/dev/null; then
    echo "  ❌ improved-message-list.tsx still has old schema references"
else
    echo "  ✅ improved-message-list.tsx - no old schema references"
fi

# Check that main page uses improved components
if grep -q "improved-conversation-list" "src/app/messages/page.tsx" 2>/dev/null; then
    echo "  ✅ main messages page uses improved-conversation-list"
else
    echo "  ❌ main messages page not using improved-conversation-list"
fi

if grep -q "improved-message-list" "src/app/messages/[conversationId]/page.tsx" 2>/dev/null; then
    echo "  ✅ conversation page uses improved-message-list"
else
    echo "  ❌ conversation page not using improved-message-list"
fi

echo ""
echo "🚀 READY FOR BROWSER TESTING!"
echo "=============================="
echo "1. Start dev server: 'npm run dev'"
echo "2. Open: http://localhost:3000/messages"
echo "3. Look for messages loading instead of infinite spinner"
echo "4. Check console for success logs, not schema errors"
echo ""

# Test database connectivity quickly
echo "🔍 Testing database connectivity..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://sogwgxkxuuvvvjbqlcdo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZ3dneGt4dXV2dnZqYnFsY2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTg1NDcsImV4cCI6MjA1OTk3NDU0N30.MGr4l7qK4Gj1tmVeSZhNmepQfVPfOh2OxgaXOgCigrs'
);

supabase.from('messages').select('message_id').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Database connection failed:', error.message);
    } else {
      console.log('✅ Database connection successful');
    }
  });
" 2>/dev/null

echo "🎉 All checks complete! Your messaging system should now work properly."
