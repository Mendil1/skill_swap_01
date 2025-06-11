#!/bin/bash
echo "Starting skill-swap development server..."
cd "c:/Users/Mendi/DEV_PFE/skill-swap-01"
echo "Current directory: $(pwd)"
echo "Checking if dependencies are installed..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "Starting Next.js development server..."
npm run dev
