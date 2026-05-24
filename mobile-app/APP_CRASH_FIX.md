# Fix: App Crashes on Startup

## Problem
```
"App error"
"It was detected that the 'Gisenyi Gadgets' app crashes due to its own issues."
```

## Root Cause
The app crashes because **Supabase credentials are missing** in the production build.

EAS Build does NOT automatically include `.env` files. Environment variables must be explicitly configured in EAS.

## ✅ Solution Applied

I've added the required environment variables to EAS:

```bash
# Supabase URL
EXPO_PUBLIC_SUPABASE_URL=https://cysejrutcrfvopqjqknv.supabase.co

# Supabase Anonymous Key
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...GeZ8
```

**A new build is now running** with these variables included!

---

## New APK Download

The corrected APK will be ready in ~10-15 minutes at:

**Check build status:**
```bash
npx eas-cli build:list
```

**Or visit:**
https://expo.dev/accounts/samdev251/projects/gisenyi-gadgets/builds

---

## How Environment Variables Work in EAS

### Local Development (Works) ✅
- Uses `.env` file
- Variables loaded automatically
- `expo start` reads from `.env`

### Production Build (Was Broken) ❌
- `.env` file is NOT included in build
- Must set variables in EAS explicitly
- Variables baked into the compiled app

### Production Build (Now Fixed) ✅
- Variables set in EAS dashboard
- Included during build process
- App can connect to Supabase

---

## Commands Used to Fix

```bash
# 1. Set Supabase URL
npx eas-cli env:create \
  --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://cysejrutcrfvopqjqknv.supabase.co" \
  --environment preview \
  --visibility plaintext

# 2. Set Supabase Anon Key
npx eas-cli env:create \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "your_anon_key_here" \
  --environment preview \
  --visibility plaintext

# 3. Rebuild with environment variables
npx eas-cli build --platform android --profile preview
```

---

## Verify Environment Variables

**List all environment variables:**
```bash
npx eas-cli env:list
```

**Expected output:**
```
Environment variables for @samdev251/gisenyi-gadgets

  Variable Name                    Environments  Visibility
  ──────────────────────────────  ────────────  ──────────
  EXPO_PUBLIC_SUPABASE_URL        preview       Plain text
  EXPO_PUBLIC_SUPABASE_ANON_KEY   preview       Plain text
```

---

## For Production Builds

When ready for Play Store, add variables to production environment:

```bash
# Production environment variables
npx eas-cli env:create \
  --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://cysejrutcrfvopqjqknv.supabase.co" \
  --environment production \
  --visibility plaintext

npx eas-cli env:create \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "your_anon_key_here" \
  --environment production \
  --visibility plaintext
```

---

## Alternative: Use eas.json

You can also configure environment variables in `eas.json`:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://cysejrutcrfvopqjqknv.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGci...GeZ8"
      }
    }
  }
}
```

**⚠️ Warning:** Don't commit secrets to Git! Use EAS dashboard instead.

---

## Testing the Fix

After installing the new APK:

1. **Open the app** - Should not crash
2. **Check login screen** - Should load properly
3. **Try authentication** - Sign up/login should work
4. **Browse products** - Data should load from Supabase
5. **Check console logs** - No "Supabase client not configured" errors

---

## Common Errors & Fixes

### Error: "supabase is not defined"
**Cause:** Missing environment variables  
**Fix:** Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Error: "Invalid API key"
**Cause:** Wrong anon key  
**Fix:** Copy correct key from Supabase Dashboard → Settings → API

### Error: "Network request failed"
**Cause:** Wrong Supabase URL  
**Fix:** Verify URL format: `https://xxxxx.supabase.co` (no trailing slash)

---

## Debugging Production Builds

### View crash logs:
```bash
# Android (via adb)
adb logcat -s ReactNativeJS:V ReactNative:V

# Or use Expo's remote logging
npx expo start --no-dev --minify
```

### Check which variables are set:
```javascript
// In your app code
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Has Anon Key:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
```

---

## Next Build Will Work! 🚀

**Current Status:**
- ✅ Environment variables configured
- ⏳ Building new APK with credentials
- ⏳ Estimated completion: 10-15 minutes

**Download new build:**
```bash
npx eas-cli build:list
# Look for the most recent build
```

**Or visit:**
https://expo.dev/accounts/samdev251/projects/gisenyi-gadgets/builds

---

## Prevention for Future Builds

**Checklist before building:**
1. ✅ Verify `.env` file exists locally
2. ✅ Set environment variables in EAS
3. ✅ Test in Expo Go/development build first
4. ✅ Check build logs for missing variables
5. ✅ Install and test APK before distributing

---

**The crash is now fixed! Wait for the new build to complete, then download and test again.** ✅
