import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';
import { Flame } from 'lucide-react-native';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const { colors } = useTheme();

  if (streak === 0) return null;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.sageSoft }]}
      accessibilityLabel={`${streak} day streak`}
    >
      <Flame color={colors.sage} size={16} />
      <Text variant="caption" color={colors.sage} style={styles.text}>
        {streak} day{streak !== 1 ? 's' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});
