import { View, type ViewProps, StyleSheet, Platform } from 'react-native';
import { layout, shadows } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export function Card({ children, style, elevated = true, ...props }: CardProps) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        elevated && (isDark ? styles.darkBorder : shadows.sm),
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
});
