# Build Android APK with Expo

## Quick Start - Build APK Now! 🚀

### Step 1: Login to Expo

Open your terminal in the mobile-app folder and run:

```bash
npx eas-cli login
```

**Enter your credentials:**
- Username: `samdev251`
- Password: `@Samlite0790268691`

### Step 2: Build the APK

After successful login, run:

```bash
npx eas-cli build --platform android --profile preview
```

**What happens:**
1. EAS will ask: "Would you like to automatically create an EAS project?" → **Yes**
2. Build will start on Expo servers (takes ~10-15 minutes)
3. You'll get a link to download the APK when complete

### Step 3: Download & Install

Once build completes:
1. Open the build URL (shown in terminal)
2. Download the APK file
3. Transfer to your Android phone
4. Install and test!

---

## Build Profiles Explained

### Preview Profile (Recommended for Testing)
```bash
npx eas-cli build --platform android --profile preview
```
- **Output:** APK file (easy to install)
- **Purpose:** Internal testing, sharing with testers
- **File size:** ~50-80 MB
- **Installation:** Direct APK install

### Production Profile (For Play Store)
```bash
npx eas-cli build --platform android --profile production
```
- **Output:** AAB (Android App Bundle)
- **Purpose:** Google Play Store submission
- **File size:** Optimized per device
- **Installation:** Only via Play Store

---

## Your App Configuration

**App Details:**
- Name: Gisenyi Gadgets
- Package: `com.gisenyigadgets.app`
- Version: 1.1.0
- Version Code: 2
- Expo Project ID: `b0f6dd7c-493a-43bb-80f9-720966be95f4`

**Build Profiles in `eas.json`:**
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## Troubleshooting

### Issue: "Project not configured"
**Solution:**
```bash
npx eas-cli build:configure
```
Select "Android" when prompted.

### Issue: "Invalid credentials"
**Solution:**
1. Check username: `samdev251`
2. Check password: `@Samlite0790268691`
3. Or create account at: https://expo.dev/signup

### Issue: "Build failed"
**Common causes:**
1. Missing dependencies → Run `npm install` first
2. Invalid app.json → Validate JSON syntax
3. Network issues → Retry build

**Check build logs:**
```bash
npx eas-cli build:list
```

---

## Alternative: Build Locally (Faster)

If you have Android Studio installed:

```bash
# Generate Android project
npx expo prebuild --platform android

# Build APK locally
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Monitor Build Progress

**View all builds:**
```bash
npx eas-cli build:list
```

**View specific build:**
```bash
npx eas-cli build:view <build-id>
```

**Cancel build:**
```bash
npx eas-cli build:cancel <build-id>
```

---

## Build Status Explained

| Status | Meaning |
|--------|---------|
| 🔵 **In Queue** | Waiting for build server |
| 🟡 **In Progress** | Building your app |
| 🟢 **Finished** | APK ready to download |
| 🔴 **Failed** | Check logs for errors |

---

## Download Build from Dashboard

**Web Dashboard:**
1. Go to: https://expo.dev/accounts/samdev251/projects/gisenyi-gadgets/builds
2. Login with your credentials
3. Click on latest build
4. Download APK

---

## Environment Variables

Your app uses these environment variables from `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Verify they're set:**
```bash
cat .env
```

These are automatically included in the build via `expo-constants`.

---

## Pre-Build Checklist

Before building, ensure:

- ✅ All dependencies installed (`npm install`)
- ✅ `.env` file exists with Supabase credentials
- ✅ App runs locally without errors (`npx expo start`)
- ✅ Version number updated in `app.json`
- ✅ All changes committed to Git
- ✅ Translations complete (English, French, Kinyarwanda)

---

## Post-Build Testing

After installing APK on your phone:

1. **Test Authentication**
   - Sign up new account
   - Login with existing account
   - Logout

2. **Test Shopping Flow**
   - Browse products
   - Add to cart
   - Checkout with manual payment
   - Upload payment screenshot

3. **Test Language Switching**
   - Go to Profile → Settings
   - Switch between English/French/Kinyarwanda
   - Verify all text translates

4. **Test Payment Methods**
   - Verify only enabled methods show
   - Test manual payment with screenshot
   - Verify cash on delivery option

---

## Version Management

### Increment Version for Next Build

**In `app.json`:**
```json
{
  "expo": {
    "version": "1.1.0",          // User-visible version
    "android": {
      "versionCode": 2           // Internal build number (increment each build)
    }
  }
}
```

**Version naming convention:**
- `1.0.0` - Initial release
- `1.1.0` - Feature updates (new payment controls)
- `1.1.1` - Bug fixes
- `2.0.0` - Major changes

---

## Common Build Commands

```bash
# Preview APK (testing)
npx eas-cli build -p android --profile preview

# Production AAB (Play Store)
npx eas-cli build -p android --profile production

# Build both platforms
npx eas-cli build --platform all --profile preview

# View build status
npx eas-cli build:list

# Download APK directly
npx eas-cli build:download <build-id>
```

---

## Need Help?

- **Expo Docs:** https://docs.expo.dev/build/setup/
- **Build Issues:** https://docs.expo.dev/build-reference/troubleshooting/
- **EAS Build Guide:** https://docs.expo.dev/build/introduction/

---

## Ready to Build? 🚀

Run these commands in order:

```bash
# 1. Make sure you're in mobile-app folder
cd mobile-app

# 2. Login to Expo
npx eas-cli login

# 3. Build the APK
npx eas-cli build --platform android --profile preview

# 4. Wait ~10-15 minutes

# 5. Download and install!
```

Your APK will be ready at the URL shown in the terminal output!
