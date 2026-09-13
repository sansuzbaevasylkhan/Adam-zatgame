import { Platform } from 'react-native';

export const Colors = {
  // Backgrounds
  bg: '#0A0A0B',
  surface: '#151517',
  surfaceElevated: '#1E1E21',
  surfaceHover: '#252528',
  card: '#1A1A1D',
  overlay: 'rgba(10, 10, 11, 0.85)',

  // Text
  text: '#F5F5F7',
  textSecondary: '#9A9AA0',
  textTertiary: '#5C5C63',
  textInverse: '#0A0A0B',

  // Brand
  gold: '#E8B948',
  goldLight: '#F5D061',
  goldDark: '#B8941F',
  goldDim: 'rgba(232, 185, 72, 0.15)',

  // Accents
  blue: '#4A9EFF',
  green: '#34D399',
  red: '#F87171',
  orange: '#FB923C',
  purple: '#A78BFA',

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderHover: 'rgba(255, 255, 255, 0.12)',
  borderGold: 'rgba(232, 185, 72, 0.25)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  huge: 38,
  display: 48,
  mega: 64,
};

export const Fonts = {
  display: 'Unbounded-Bold',
  heading: 'Unbounded-SemiBold',
  body: 'Manrope-Regular',
  bodyBold: 'Manrope-Bold',
  bodySemiBold: 'Manrope-SemiBold',
};

export const Shadows = {
  card: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8 },
    android: { elevation: 4 },
    default: {},
  }),
  gold: Platform.select({
    ios: { shadowColor: '#E8B948', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
    android: { elevation: 6 },
    default: {},
  }),
};
