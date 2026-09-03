import { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { type Reminder } from '@/database/queries/reminders';
import { spacing, layout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { Bell, Repeat } from 'lucide-react-native';
import { formatTime } from '@/utils/dates';
import { useRouter } from 'expo-router';

interface ReminderItemProps {
  reminder: Reminder;
  index?: number;
}

export const ReminderItem = memo(function ReminderItem({ reminder, index = 0 }: ReminderItemProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const isRecurring = reminder.is_recurring === 1;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/reminder/${reminder.id}`)}
        style={styles.container}
      >
        <View style={[styles.icon, { backgroundColor: colors.sageSoft }]}>
          <Bell color={colors.sage} size={18} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text variant="body" style={styles.title} numberOfLines={1}>{reminder.title}</Text>
            {isRecurring && <Repeat color={colors.sage} size={14} />}
          </View>
          <Text variant="caption" color={colors.stone}>
            {formatTime(reminder.time)}
            {reminder.recurrence_type ? ` · ${reminder.recurrence_type}` : ''}
            {reminder.description ? ` · ${reminder.description}` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: layout.screenPaddingH,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: { flex: 1 },
});
