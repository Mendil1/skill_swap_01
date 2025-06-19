@echo off
echo 🔧 Authentication Client-Server Sync Fix - Test Server
echo ===================================================

cd /d "c:\Users\Mendi\DEV_PFE\skill-swap-01"

echo 🔨 Building application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build successful
echo.

echo 🚀 Starting production server...
echo 🌐 Server will be available at: http://localhost:3000
echo.
echo 🧪 TEST INSTRUCTIONS:
echo 1. Login with: 360z8@ptct.net / 000000
echo 2. Navigate to /profile
echo 3. Verify real user data appears (not Demo User)
echo 4. Check console for [AuthProvider] logs
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run start
