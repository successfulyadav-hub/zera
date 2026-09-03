import { View, type ViewProps, StyleSheet } from 'react-native';
import { Text } from './Text';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export interface BadgeProps extends ViewProps {
  label: string;
}

export function Badge({ label, style, ...props }: BadgeProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors.sageSoft }, style]} {...props}>
      <Text variant="caption" color={colors.sage}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
});
