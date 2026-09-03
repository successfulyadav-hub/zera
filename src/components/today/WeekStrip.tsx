import { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';
import { hapticSelection } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_WIDTH = SCREEN_WIDTH / 7;

interface WeekStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function WeekStrip({ selectedDate, onSelectDate }: WeekStripProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const weekStart = startOfWeek(selectedDate);
  const days: Date[] = [];
  for (let i = -7; i < 14; i++) {
    days.push(addDays(weekStart, i));
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: 7 * DAY_WIDTH, animated: false });
  }, []);

  const handleSelect = (date: Date) => {
    hapticSelection();
    onSelectDate(date);
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
      snapToInterval={DAY_WIDTH}
      decelerationRate="fast"
    >
      {days.map((day) => {
        const selected = isSameDay(day, selectedDate);
        const today = isToday(day);
        return (
          <TouchableOpacity
            key={day.toISOString()}
            style={styles.dayCell}
            activeOpacity={0.7}
            onPress={() => handleSelect(day)}
          >
            <Text
              variant="caption"
              color={selected ? colors.sage : colors.stone}
              align="center"
            >
              {format(day, 'EEE')}
            </Text>
            <View
              style={[
                styles.dayCircle,
                selected && { backgroundColor: colors.sage },
                today && !selected && { borderWidth: 1, borderColor: colors.sage },
              ]}
            >
              <Text
                variant="bodyMedium"
                color={selected ? '#FFFFFF' : colors.ink}
                align="center"
              >
                {format(day, 'd')}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { paddingVertical: spacing.sm },
  dayCell: {
    width: DAY_WIDTH,
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
