#!/bin/bash

echo "🔍 Quick Sign In Button Test"
echo "============================="
echo ""

echo "🌐 Open your browser and:"
echo "1. Go to http://localhost:3000"
echo "2. Open browser console (F12)"
echo "3. Paste this code:"
echo ""
echo "// Quick Sign In test"
echo "const signInBtn = document.querySelector('a[href=\"/login\"]');"
echo "if (signInBtn) {"
echo "  console.log('✅ Sign In button found:', signInBtn);"
echo "  console.log('Button visible:', signInBtn.offsetParent !== null);"
echo "  console.log('Screen width:', window.innerWidth);"
echo "  if (window.innerWidth >= 768) {"
echo "    console.log('Desktop view - button should be visible');"
echo "  } else {"
echo "    console.log('Mobile view - check hamburger menu');"
echo "  }"
echo "} else {"
echo "  console.log('❌ Sign In button not found');"
echo "  const profileBtn = document.querySelector('a[href=\"/profile\"]');"
echo "  if (profileBtn && profileBtn.offsetParent !== null) {"
echo "    console.log('⚠️  User appears to be logged in - Sign In hidden');"
echo "  }"
echo "}"
echo ""
echo "4. If button is found but not working, try:"
echo "   window.location.href = '/login'"
echo ""
echo "5. Check if you're already logged in (Profile button visible)"

# Test if we can reach the login page directly
echo ""
echo "🧪 Testing login page accessibility..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login > /tmp/login_test.txt
login_status=$(cat /tmp/login_test.txt)

if [ "$login_status" = "200" ]; then
    echo "✅ Login page is accessible (HTTP $login_status)"
    echo "   Try going directly to: http://localhost:3000/login"
else
    echo "❌ Login page returned HTTP $login_status"
fi

echo ""
echo "💡 Common issues:"
echo "• Screen too small (button hidden on mobile - use hamburger menu)"
echo "• Already logged in (Sign In button hidden, Profile button visible)"
echo "• JavaScript errors preventing navigation"
echo "• Browser caching issues"
