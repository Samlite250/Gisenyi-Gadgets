@echo off
echo ============================================
echo   Gisenyi Gadgets - APK Build Script
echo ============================================
echo.

cd /d "%~dp0"

echo Step 1: Checking if logged in to Expo...
npx eas-cli whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo You need to login first!
    echo.
    echo Please run: npx eas-cli login
    echo.
    echo Username: samdev251
    echo Password: @Samlite0790268691
    echo.
    pause
    exit /b 1
)

echo ✓ Logged in to Expo
echo.

echo Step 2: Starting APK build (preview profile)...
echo.
echo This will take 10-15 minutes...
echo.
npx eas-cli build --platform android --profile preview --non-interactive

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   Build started successfully!
    echo ============================================
    echo.
    echo Check build progress at:
    echo https://expo.dev/accounts/samdev251/projects/gisenyi-gadgets/builds
    echo.
) else (
    echo.
    echo ============================================
    echo   Build failed!
    echo ============================================
    echo.
    echo Check the error above or run manually:
    echo npx eas-cli build --platform android --profile preview
    echo.
)

pause
