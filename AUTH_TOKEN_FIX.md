# Authentication Token Refresh Error - Fixed

## Issue
The mobile app was throwing `AuthApiError: Invalid Refresh Token: Refresh Token Not Found` errors (HTTP 400) on startup. This occurred when stale/invalid refresh tokens were stored in AsyncStorage from a previous session.

## Root Cause
- Supabase was attempting to automatically refresh an invalid/expired token stored in AsyncStorage
- The auth context wasn't properly clearing corrupted session data before Supabase tried to use it
- Error messages weren't being suppressed, causing console spam

## Fixes Applied

### 1. Enhanced Session Clearing (`AuthContext.js`)
**Location:** `/mobile-app/src/context/AuthContext.js`

- Added AsyncStorage key cleanup to `clearStaleSession()` function
- Now forcefully removes all Supabase auth tokens from AsyncStorage before signing out
- Prevents corrupted tokens from persisting between sessions

```javascript
const clearStaleSession = async () => {
  try {
    // Force clear AsyncStorage keys
    const keys = await AsyncStorage.getAllKeys();
    const supabaseKeys = keys.filter(key =>
      key.includes('supabase.auth.token') ||
      key.includes('sb-') ||
      key.startsWith('supabase-auth-token')
    );
    if (supabaseKeys.length > 0) {
      await AsyncStorage.multiRemove(supabaseKeys);
      authLogger.info('Cleared stale session keys from AsyncStorage');
    }
  } catch (err) {
    authLogger.warn('Failed to clear AsyncStorage keys:', err.message);
  }

  await supabase.auth.signOut({ scope: 'local' });
  setSession(null);
  setUser(null);
  setProfile(null);
};
```

### 2. Better Error Handling
- Added try-catch wrapper for initial session retrieval
- Enhanced logging to track when sessions are being cleared
- Added handling for `USER_DELETED` auth events

### 3. Supabase Client Configuration (`supabase.js`)
**Location:** `/mobile-app/src/services/supabase.js`

- Disabled debug mode to suppress noisy token refresh errors
- Auth errors are now handled silently by AuthContext

```javascript
auth: {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: Platform.OS === 'web',
  storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
  debug: false, // Suppress noisy token refresh errors
}
```

## Result
✅ Invalid token errors are automatically detected and handled
✅ Corrupted sessions are cleared from AsyncStorage
✅ No more console spam with 400 errors
✅ Users can sign in fresh without manual cache clearing

## Testing
1. Start the mobile app
2. If there was a stale token, it will be automatically cleared
3. User will see the login screen (SIGNED_OUT state)
4. No error messages in the console

## Prevention
The enhanced `clearStaleSession()` function now runs automatically when:
- Initial session retrieval fails
- Token refresh fails
- Auth state changes to SIGNED_OUT or USER_DELETED

This ensures the app always starts with a clean auth state if there are any session-related errors.
