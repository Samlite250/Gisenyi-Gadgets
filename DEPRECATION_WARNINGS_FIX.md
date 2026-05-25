# React Native Web Deprecation Warnings - Fixed

## Issue
The mobile app was showing deprecation warnings in the browser console:
1. `"shadow*" style props are deprecated. Use "boxShadow".`
2. `props.pointerEvents is deprecated. Use style.pointerEvents`

## Root Cause
React Native Web (the library that allows React Native apps to run in browsers) has deprecated some prop patterns:

1. **Shadow Properties**: Direct use of `shadowColor`, `shadowOffset`, `shadowOpacity`, and `shadowRadius` in styles without using `Platform.select` to provide web-specific `boxShadow`
2. **pointerEvents Prop**: Using `pointerEvents` as a direct prop on components instead of including it in the `style` prop

## Files Fixed

### 1. OrdersScreen.js
**Location:** `/mobile-app/src/screens/OrdersScreen.js`

**Changes:**
- Moved `pointerEvents="auto"` from props to style object for two TouchableOpacity components:
  - Confirm Receipt button (line 255)
  - Review button (line 284)

```javascript
// Before
<TouchableOpacity pointerEvents="auto">

// After
<TouchableOpacity style={[styles.confirmReceiptBtn, { pointerEvents: 'auto' }]}>
```

### 2. OrderReviewScreen.js
**Location:** `/mobile-app/src/screens/OrderReviewScreen.js`

**Changes:**
- Added `Platform` to imports
- Wrapped shadow properties with `Platform.select` for two styles:
  - `productCard` style (line 348-358)
  - `submitButton` style (line 458-472)

```javascript
// Before
productCard: {
  backgroundColor: '#fff',
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
}

// After
productCard: {
  backgroundColor: '#fff',
  borderRadius: 12,
  ...Platform.select({
    web: { boxShadow: '0px 1px 4px rgba(0,0,0,0.05)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
  }),
}
```

### 3. OrderTrackingScreen.js
**Location:** `/mobile-app/src/screens/OrderTrackingScreen.js`

**Changes:**
- Added `Platform` to imports
- Wrapped shadow properties with `Platform.select` for `timelineCard` style (line 172-184)

## How Platform.select Works

`Platform.select` allows you to define platform-specific styles:
- **web**: Uses CSS `boxShadow` property (required for web compatibility)
- **default**: Uses React Native shadow properties (for iOS/Android)
- **elevation**: Android-specific property for material design shadows

This ensures the app:
1. Uses proper CSS on web browsers (no warnings)
2. Uses native shadow APIs on mobile devices (better performance)
3. Maintains consistent visual appearance across all platforms

## Result
✅ No more deprecation warnings in browser console
✅ Shadows render correctly on web using CSS `boxShadow`
✅ Shadows render correctly on mobile using native shadow APIs
✅ `pointerEvents` works correctly as a style property
✅ Improved web compatibility and standards compliance

## Best Practices

When adding shadows to new components:

```javascript
// ✅ CORRECT - Use Platform.select
const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.1)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
});

// ✅ CORRECT - Use imported SHADOWS constants
import { SHADOWS } from '../constants/theme';
const styles = StyleSheet.create({
  card: {
    ...SHADOWS.md,
  },
});

// ❌ WRONG - Direct shadow properties without Platform.select
const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});
```

When using pointerEvents:

```javascript
// ✅ CORRECT - In style prop
<TouchableOpacity style={{ pointerEvents: 'auto' }}>

// ✅ CORRECT - In StyleSheet with style array
<TouchableOpacity style={[styles.button, { pointerEvents: 'auto' }]}>

// ❌ WRONG - As direct prop
<TouchableOpacity pointerEvents="auto">
```

## Notes
The `theme.js` file already defines platform-aware shadow constants (`SHADOWS.sm`, `SHADOWS.md`, `SHADOWS.lg`) that can be reused throughout the app. Prefer using these constants over defining custom shadows.
