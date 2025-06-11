#!/bin/bash
echo "🧹 Clearing cache and starting fresh development server..."

# Navigate to project directory
cd /c/Users/Mendi/DEV_PFE/skill-swap-01

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Start development server
echo "Starting development server..."
npm run dev
