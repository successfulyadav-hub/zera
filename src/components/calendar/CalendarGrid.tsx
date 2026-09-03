import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarGridProps {
  month: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  eventDots?: Set<string>;
  taskDots?: Set<string>;
}

export function CalendarGrid({ month, selectedDate, onSelectDate, eventDots, taskDots }: CalendarGridProps) {
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

  return (
    <View style={styles.container}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((d, i) => (
          <View key={i} style={styles.cell}>
            <Text variant="caption" color={colors.stone} align="center">{d}</Text>
          </View>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((d) => {
            const inMonth = isSameMonth(d, month);
            const selected = isSameDay(d, selectedDate);
            const today = isToday(d);
            const dateKey = format(d, 'yyyy-MM-dd');
            const hasEvent = eventDots?.has(dateKey);
            const hasTask = taskDots?.has(dateKey);

            return (
              <TouchableOpacity
                key={dateKey}
                style={styles.cell}
                activeOpacity={0.7}
                onPress={() => onSelectDate(d)}
              >
                <View style={[
                  styles.dayCircle,
                  selected && { backgroundColor: colors.sage },
                  today && !selected && { borderWidth: 1, borderColor: colors.sage },
                ]}>
                  <Text
                    variant="bodySmall"
                    align="center"
                    color={
                      selected ? '#FFFFFF' :
                      !inMonth ? colors.divider :
                      colors.ink
                    }
                  >
                    {format(d, 'd')}
                  </Text>
                </View>
                <View style={styles.dotsRow}>
                  {hasEvent && <View style={[styles.dot, { backgroundColor: selected ? colors.sageSoft : colors.sage }]} />}
                  {hasTask && <View style={[styles.dot, { backgroundColor: selected ? colors.sageSoft : colors.stone }]} />}
                </View>
              </TouchableOpacity>
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
    paddingVertical: spacing.xs,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
