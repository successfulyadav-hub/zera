import { View, type ViewProps, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { layout, shadows } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
  glass?: boolean;
}

export function Card({ children, style, elevated = true, glass = false, ...props }: CardProps) {
  const { colors, isDark } = useTheme();

  if (glass && Platform.OS !== 'web') {
    return (
      <View style={[styles.card, styles.glassOuter, style]} {...props}>
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.glassOverlay, {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.45)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
        }]} />
        <View style={styles.glassContent}>{children}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        glass
          ? {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
            }
          : { backgroundColor: colors.surface },
        elevated && !glass && (isDark ? styles.darkBorder : shadows.sm),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
  },
  darkBorder: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  glassOuter: {
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
  },
  glassContent: {
    zIndex: 1,
  },
});
