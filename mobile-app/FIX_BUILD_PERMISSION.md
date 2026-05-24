# Fix EAS Build Permission Error

## Problem
```
You don't have the required permissions to perform this operation.
Entity not authorized: AppEntity[b0f6dd7c-493a-43bb-80f9-720966be95f4]
```

This happens because the project was created under a different Expo account.

## Solution - Create New Project for Your Account

### Step 1: Remove Old Project ID

✅ **Already done!** I've removed the old project ID from `app.json`.

### Step 2: Create New Expo Project

**Run this command:**

```bash
npx eas-cli build:configure
```

When it asks: **"Would you like to automatically create an EAS project for @samdev251/gisenyi-gadgets?"**

**Answer:** `Yes` (or just press Enter)

This will:
- Create a new project under your account (`samdev251`)
- Generate a new project ID
- Update your `app.json` automatically

### Step 3: Build the APK

After configuration, run:

```bash
npx eas-cli build --platform android --profile preview
```

---

## Alternative: Use Expo Dashboard

If the command doesn't work, create the project manually:

1. **Go to:** https://expo.dev/
2. **Login** with:
   - Username: `samdev251`
   - Password: `@Samlite0790268691`
3. Click **"+ New Project"**
4. Enter name: `gisenyi-gadgets`
5. Copy the new project ID
6. Update `app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "YOUR_NEW_PROJECT_ID"
      }
    }
  }
}
```

---

## What Changed in app.json

**Before:**
```json
"extra": {
  "eas": {
    "projectId": "b0f6dd7c-493a-43bb-80f9-720966be95f4"  // Old project
  }
}
```

**After:**
```json
"owner": "samdev251",  // Added: specifies your account
// projectId will be auto-generated when you run eas build:configure
```

---

## Verification

After creating the project, verify:

```bash
# Check you're logged in correctly
npx eas-cli whoami

# Should show:
# samdev251
# gisenyigadgets@gmail.com

# Check project configuration
npx eas-cli project:info

# Should show your new project details
```

---

## Full Build Steps (After Fix)

```bash
# 1. Configure project (creates new project ID)
npx eas-cli build:configure

# 2. Build APK
npx eas-cli build --platform android --profile preview

# 3. Monitor build
npx eas-cli build:list

# 4. Download when complete
# URL will be shown in terminal output
```

---

## Expected Output

When build starts successfully:

```
✔ Build credentials set up
✔ Generating the project tarball
✔ Uploading project to EAS Build
✔ Build queued

Build ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Build URL: https://expo.dev/accounts/samdev251/projects/gisenyi-gadgets/builds/...

Waiting for build to complete...
```

---

## Troubleshooting

### Still getting permission error?

**Check project ownership:**
```bash
npx eas-cli project:info
```

Make sure it shows:
- Owner: `samdev251`
- Project: `gisenyi-gadgets`

### Wrong account logged in?

```bash
# Logout
npx eas-cli logout

# Login again
npx eas-cli login
# Username: samdev251
# Password: @Samlite0790268691
```

### Need to delete old project link?

```bash
# Remove eas.json (if exists)
rm eas.json

# Remove project ID from app.json
# (already done in this fix)

# Reconfigure
npx eas-cli build:configure
```

---

## Ready to Build!

Your app.json is now configured with `"owner": "samdev251"`.

**Next step:** Run the interactive command in your terminal:

```bash
npx eas-cli build:configure
```

Then answer **Yes** when asked to create the project!
