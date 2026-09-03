import { DMSans_300Light, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { Caveat_400Regular, Caveat_600SemiBold } from '@expo-google-fonts/caveat';

export const fontFamilies = {
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  sansLight: 'DMSans_300Light',
  cursive: 'Caveat_400Regular',
  cursiveSemiBold: 'Caveat_600SemiBold',
} as const;

export const fontAssets = {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  Caveat_400Regular,
  Caveat_600SemiBold,
};

export const typeScale = {
  display: { fontFamily: fontFamilies.sansSemiBold, fontSize: 28, lineHeight: 36, letterSpacing: -0.5 },
  screenTitle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 22, lineHeight: 30, letterSpacing: -0.3 },
  bodyMedium: { fontFamily: fontFamilies.sansMedium, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  body: { fontFamily: fontFamilies.sans, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  bodySmall: { fontFamily: fontFamilies.sans, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  caption: { fontFamily: fontFamilies.sans, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  timestamp: { fontFamily: fontFamilies.sansLight, fontSize: 11, lineHeight: 14, letterSpacing: 0.3 },
  sectionLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 13, lineHeight: 16, letterSpacing: 0.8 },
  navLabel: { fontFamily: fontFamilies.sansMedium, fontSize: 11, lineHeight: 14, letterSpacing: 0.3 },
  cursive: { fontFamily: fontFamilies.cursive, fontSize: 20, lineHeight: 28 },
  cursiveLg: { fontFamily: fontFamilies.cursiveSemiBold, fontSize: 26, lineHeight: 34 },
} as const;
