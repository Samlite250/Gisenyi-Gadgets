// ============================================================
// GISENYI GADGETS - GLOBAL DESIGN SYSTEM / THEME
// ============================================================

export const COLORS = {
  // Brand
  primaryBlue: '#4285F4',
  primaryGreen: '#34A853',
  error: '#EA4335',
  warning: '#FBBC04',

  // Backgrounds
  darkBg: '#FFFFFF', // Now Light
  cardBg: '#FFFFFF', // Now Light
  inputBg: '#F5F5F5',
  surfaceBg: '#F8F9FA', // Light surface

  // Text
  textPrimary: '#202124',
  textSecondary: '#5F6368',
  textMuted: '#9AA0A6',
  textDark: '#202124',

  // Borders
  border: '#E8EAED',
  borderLight: '#F1F3F4',

  // Status
  success: '#34A853',
  info: '#4285F4',

  // Overlay
  overlay: 'rgba(255, 255, 255, 0.85)',
  cardOverlay: 'rgba(255, 255, 255, 0.95)',
};

export const FONTS = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semiBold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
  extraBold: { fontWeight: '800' },
};

export const SIZES = {
  // Spacing (8pt grid)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 999,

  // Font sizes
  fontXs: 11,
  fontSm: 13,
  fontMd: 15,
  fontLg: 17,
  fontXl: 20,
  fontXxl: 24,
  fontHero: 32,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
};
