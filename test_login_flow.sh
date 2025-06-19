#!/bin/bash

echo "🧪 Testing Authentication Flow"
echo "============================="
echo ""

echo "1. 📋 Visit the auth test page:"
echo "   http://localhost:3000/auth-test"
echo ""

echo "2. 🔄 Click 'Force Logout' button first"
echo "   This should clear all server-side auth cookies"
echo ""

echo "3. ✅ After force logout, check:"
echo "   - Sign In button visible: Should be YES"
echo "   - Profile button visible: Should be NO"
echo "   - Has auth cookies: Should be NO"
echo ""

echo "4. 🔑 Then try login:"
echo "   - Click 'Force Login Page' or go to /login"
echo "   - The login form should now be accessible"
echo ""

echo "5. 🧪 Test with demo credentials:"
echo "   Email: test@example.com"
echo "   Password: test123"
echo "   (or any credentials you have)"
echo ""

echo "💡 If login still doesn't work, check:"
echo "• Browser console for errors"
echo "• Network tab for failed requests"
echo "• Supabase project settings"
echo ""

echo "🚀 Start here: http://localhost:3000/auth-test"
