import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { spacing, layout } from '@/theme';

interface DailyStatsProps {
  totalTasks: number;
  completedTasks: number;
  totalEvents: number;
}

export function DailyStats({ totalTasks, completedTasks, totalEvents }: DailyStatsProps) {
  const { colors } = useTheme();

  if (totalTasks === 0 && totalEvents === 0) return null;

  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const percentage = Math.round(progress * 100);

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <View style={styles.row}>
        {totalTasks > 0 && (
          <View style={styles.stat}>
            <View style={styles.progressRow}>
              <View style={[styles.progressBg, { backgroundColor: colors.sageSoft }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: colors.sage, width: `${percentage}%` },
                  ]}
                />
              </View>
            </View>
            <Text variant="caption" color={colors.stone}>
              {completedTasks}/{totalTasks} tasks · {percentage}%
            </Text>
          </View>
        )}
        {totalEvents > 0 && (
          <View style={styles.eventStat}>
            <Text variant="bodyMedium" color={colors.sage}>{totalEvents}</Text>
            <Text variant="caption" color={colors.stone}>
              {totalEvents === 1 ? 'event' : 'events'}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  stat: {
    flex: 1,
    gap: spacing.xs,
  },
  progressRow: { flexDirection: 'row' },
  progressBg: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  eventStat: {
    alignItems: 'center',
    gap: 2,
  },
});
