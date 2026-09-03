import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { hapticSelection } from '@/utils/haptics';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarGridProps {
  month: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onOpenDay?: (date: Date) => void;
  eventDots?: Set<string>;
  taskDots?: Set<string>;
}

function DayCell({
  day,
  month,
  selected,
  onPress,
  eventDot,
  taskDot,
}: {
  day: Date;
  month: Date;
  selected: boolean;
  onPress: () => void;
  eventDot: boolean;
  taskDot: boolean;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const inMonth = isSameMonth(day, month);
  const today = isToday(day);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.82, { duration: 60 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    );
    onPress();
  };

  return (
    <TouchableOpacity style={styles.cell} activeOpacity={1} onPress={handlePress}>
      <Animated.View
        style={[
          styles.dayCircle,
          selected && { backgroundColor: colors.sage },
          today && !selected && { borderWidth: 1.5, borderColor: colors.sage },
          animatedStyle,
        ]}
      >
        <Text
          variant="bodySmall"
          align="center"
          color={
            selected ? '#FFFFFF' : !inMonth ? colors.stone + '40' : colors.ink
          }
        >
          {format(day, 'd')}
        </Text>
      </Animated.View>
      <View style={styles.dotsRow}>
        {eventDot && (
          <View
            style={[
              styles.dot,
              { backgroundColor: selected ? colors.sageSoft : colors.sage },
            ]}
          />
        )}
        {taskDot && (
          <View
            style={[
              styles.dot,
              { backgroundColor: selected ? colors.sageSoft : colors.stone },
            ]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export function CalendarGrid({
  month,
  selectedDate,
  onSelectDate,
  onOpenDay,
  eventDots,
  taskDots,
}: CalendarGridProps) {
  const { colors } = useTheme();

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const handlePress = (d: Date) => {
    if (isSameDay(d, selectedDate) && onOpenDay) {
      onOpenDay(d);
      return;
    }
    hapticSelection();
    onSelectDate(d);
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((d, i) => (
          <View key={i} style={styles.cell}>
            <Text variant="caption" color={colors.stone} align="center">
              {d}
            </Text>
          </View>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((d) => {
            const dateKey = format(d, 'yyyy-MM-dd');
            return (
              <DayCell
                key={dateKey}
                day={d}
                month={month}
                selected={isSameDay(d, selectedDate)}
                onPress={() => handlePress(d)}
                eventDot={eventDots?.has(dateKey) ?? false}
                taskDot={taskDots?.has(dateKey) ?? false}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.sm },
  weekdayRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekRow: { flexDirection: 'row' },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
