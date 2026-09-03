import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text variant="bodyMedium" color={colors.stone} align="center">{title}</Text>
      {subtitle && (
        <Text variant="bodySmall" color={colors.stone} align="center" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xxl,
  },
  icon: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
