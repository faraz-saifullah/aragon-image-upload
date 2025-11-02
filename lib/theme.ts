/**
 * Design System Theme Configuration
 * Central source of truth for all design tokens
 */

export const theme = {
  colors: {
    // Primary Brand Colors (Orange)
    primary: {
      gradient: 'linear-gradient(90deg, #EB6002 0%, #FFB253 100%)',
      dark: '#EB6002',
      main: '#F97315',
      light: '#FFB253',
    },

    // Success Colors (Green)
    success: {
      main: '#01AC5E',
      light: '#B8E6D5',
      bg: '#E8F5F0',
    },

    // Error Colors (Red)
    error: {
      main: '#FF4E64',
      light: '#FFD4CC',
      bg: '#FFF2F0',
    },

    // Neutral Colors
    neutral: {
      50: '#F8F9FA',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },

    // Text Colors
    text: {
      primary: '#1D1D1E',
      secondary: '#282930',
      tertiary: '#475569',
      muted: '#64748B',
    },

    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#F1F5F9',
    },

    // Border Colors
    border: {
      light: '#E2E8F0',
      main: '#CBD5E1',
      dark: '#94A3B8',
      dashed: '#A6A6A6',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
      system: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Layout
  layout: {
    maxWidth: {
      container: '1400px',
      content: '416px',
    },
    header: {
      height: '3.5rem', // 56px (h-14)
    },
  },

  // Transitions
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Image Aspect Ratios
  aspectRatios: {
    thumbnail: '2048/2260',
    photo: '2048/2560',
  },

  // File Upload
  upload: {
    maxFileSize: 120 * 1024 * 1024, // 120MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/heic'],
    targetCount: 10,
    minRequiredCount: 6,
  },
} as const;

// Type helpers
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeFontSizes = typeof theme.typography.fontSize;

// CSS Variable Helpers
export const cssVars = {
  primaryGradient:
    'linear-gradient(90deg, var(--color-primary-dark) 0%, var(--color-primary-light) 100%)',
} as const;

// Export individual sections for convenience
export const colors = theme.colors;
export const typography = theme.typography;
export const spacing = theme.spacing;
export const borderRadius = theme.borderRadius;
export const shadows = theme.shadows;
export const layout = theme.layout;
export const transitions = theme.transitions;
export const aspectRatios = theme.aspectRatios;
export const upload = theme.upload;
