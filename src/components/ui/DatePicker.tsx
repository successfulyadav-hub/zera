import { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal as RNModal, Pressable, ScrollView } from 'react-native';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const selectedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewMonth, setViewMonth] = useState(selectedDate);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    const result: Date[][] = [];
    let day = calStart;
    while (day <= calEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      result.push(week);
    }
    return result;
  }, [viewMonth]);

  const handleSelect = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setVisible(false);
  };

  const displayText = value
    ? format(selectedDate, 'EEE, MMM d, yyyy')
    : 'Select date';

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, { backgroundColor: colors.surface }]}
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={label || 'Select date'}
      >
        {label && <Text variant="caption" color={colors.stone} style={styles.label}>{label}</Text>}
        <Text variant="body" color={value ? colors.ink : colors.stone}>{displayText}</Text>
      </TouchableOpacity>

      <RNModal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={[styles.dialog, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={() => setViewMonth((m) => subMonths(m, 1))}>
                <ChevronLeft color={colors.ink} size={22} />
              </TouchableOpacity>
              <Text variant="bodyMedium">{format(viewMonth, 'MMMM yyyy')}</Text>
              <TouchableOpacity onPress={() => setViewMonth((m) => addMonths(m, 1))}>
                <ChevronRight color={colors.ink} size={22} />
              </TouchableOpacity>
            </View>

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
                  const inMonth = isSameMonth(d, viewMonth);
                  const selected = isSameDay(d, selectedDate);
                  return (
                    <TouchableOpacity
                      key={d.toISOString()}
                      style={styles.cell}
                      onPress={() => handleSelect(d)}
                    >
                      <View style={[
                        styles.dayCircle,
                        selected && { backgroundColor: colors.sage },
                      ]}>
                        <Text
                          variant="bodySmall"
                          align="center"
                          color={selected ? '#FFFFFF' : !inMonth ? colors.divider : colors.ink}
                        >
                          {format(d, 'd')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </Pressable>
        </Pressable>
      </RNModal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  label: {
    marginBottom: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: spacing.lg,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
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
});
