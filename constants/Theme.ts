// Theme constants for the app — Premium Redesign

export const COLORS = {
  // Primary colors (Indigo-Violet)
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#6C3AE1',
    600: '#5B21B6',
    700: '#4C1D95',
    800: '#3B0764',
    900: '#2E1065',
  },
  // Secondary colors (Cyan)
  secondary: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  // Accent colors (Pink)
  accent: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
  // Success colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  // Warning colors
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  // Error colors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  // Neutral colors
  gray: {
    50: '#F8FAFC',
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
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  // App-specific
  background: '#F5F3FF',
  surface: '#FFFFFF',
  surfaceElevated: '#FEFEFF',
};

// Gradient definitions (start/end colors for LinearGradient)
export const GRADIENTS = {
  primary: ['#6C3AE1', '#4F46E5'] as const,
  primaryLight: ['#A78BFA', '#6C3AE1'] as const,
  accent: ['#EC4899', '#8B5CF6'] as const,
  warm: ['#F59E0B', '#EF4444'] as const,
  surface: ['#F5F3FF', '#EDE9FE'] as const,
  dark: ['#1E293B', '#0F172A'] as const,
  banner: ['#6C3AE1', '#4338CA'] as const,
};

// Badge / Status colors
export const STATUS_COLORS = {
  active: { bg: '#D1FAE5', text: '#059669' },
  pending: { bg: '#FEF3C7', text: '#D97706' },
  overdue: { bg: '#FEE2E2', text: '#DC2626' },
  submitted: { bg: '#DBEAFE', text: '#2563EB' },
  excellent: { bg: '#D1FAE5', text: '#059669' },
  average: { bg: '#FEF3C7', text: '#D97706' },
  info: { bg: '#EDE9FE', text: '#6C3AE1' },
};

export const FONTS = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  bold: 'Poppins-Bold',
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

const SHADOWS = {
  sm: {
    shadowColor: '#6C3AE1',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#6C3AE1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#6C3AE1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    shadowColor: '#6C3AE1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 30,
  full: 9999,
};

export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
  GRADIENTS,
  STATUS_COLORS,
};
