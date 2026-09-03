import { View, type ViewProps, StyleSheet } from 'react-native';
import { radius, layout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
  },
});
