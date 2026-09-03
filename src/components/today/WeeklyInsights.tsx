import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';
import { tasksQuery } from '@/database/queries/tasks';
import { TrendingUp } from 'lucide-react-native';

interface DayStat {
  date: string;
  total: number;
  completed: number;
}

export function WeeklyInsights() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<DayStat[]>([]);

  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const start = weekAgo.toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];
    tasksQuery.getCompletionStats(start, end).then(setStats);
  }, []);

  const totalTasks = stats.reduce((s, d) => s + d.total, 0);
  const totalCompleted = stats.reduce((s, d) => s + d.completed, 0);
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const activeDays = stats.length;

  if (totalTasks === 0) return null;

  const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const bars: { label: string; total: number; completed: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const stat = stats.find((s) => s.date === key);
    bars.push({
      label: DAYS[d.getDay()],
      total: stat?.total ?? 0,
      completed: stat?.completed ?? 0,
    });
  }

  const maxTotal = Math.max(...bars.map((b) => b.total), 1);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <TrendingUp color={colors.sage} size={16} />
        <Text variant="caption" color={colors.stone} style={styles.headerText}>
          WEEKLY INSIGHTS
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text variant="screenTitle" color={colors.ink}>{completionRate}%</Text>
          <Text variant="caption" color={colors.stone}>completion</Text>
        </View>
        <View style={styles.stat}>
          <Text variant="screenTitle" color={colors.ink}>{totalCompleted}</Text>
          <Text variant="caption" color={colors.stone}>completed</Text>
        </View>
        <View style={styles.stat}>
          <Text variant="screenTitle" color={colors.ink}>{activeDays}</Text>
          <Text variant="caption" color={colors.stone}>active days</Text>
        </View>
      </View>

      <View style={styles.chart}>
        {bars.map((bar, i) => {
          const height = bar.total > 0 ? (bar.completed / maxTotal) * 48 : 0;
          const bgHeight = bar.total > 0 ? (bar.total / maxTotal) * 48 : 2;
          return (
            <View key={i} style={styles.barCol}>
              <View style={styles.barContainer}>
                <View style={[styles.barBg, { height: bgHeight, backgroundColor: colors.divider }]} />
                <View style={[styles.barFill, { height, backgroundColor: colors.sage }]} />
              </View>
              <Text variant="caption" color={colors.stone} style={styles.barLabel}>{bar.label}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  headerText: { textTransform: 'uppercase' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  stat: { alignItems: 'center' },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barCol: { alignItems: 'center', flex: 1 },
  barContainer: {
    width: 16,
    height: 48,
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barBg: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 4,
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: { marginTop: spacing.xs },
});
