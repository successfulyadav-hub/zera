import type { ViewStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const layout = {
  screenPaddingH: 24,
  cardPadding: 16,
  cardRadius: 16,
  minTouchTarget: 44,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#1E1C18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  } as ViewStyle,
  deep: {
    shadowColor: '#1E1C18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  } as ViewStyle,
};

export const animation = {
  micro: 150,
  short: 200,
  medium: 300,
} as const;
