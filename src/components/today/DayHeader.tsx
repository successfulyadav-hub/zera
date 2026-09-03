import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { format } from 'date-fns';
import { spacing, layout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface DayHeaderProps {
  date: Date;
}

export function DayHeader({ date }: DayHeaderProps) {
  const { colors } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const day = new Date().getDate();
    if (hour >= 5 && hour < 12) {
      const m = ['good morning', 'rise and create', 'a fresh start', 'morning light'];
      return m[day % m.length];
    }
    if (hour >= 12 && hour < 17) {
      const a = ['good afternoon', 'keep flowing', 'steady pace', 'afternoon focus'];
      return a[day % a.length];
    }
    if (hour >= 17 && hour < 21) {
      const e = ['good evening', 'golden hour', 'winding down', 'evening glow'];
      return e[day % e.length];
    }
    const n = ['wind down', 'rest well', 'night owl', 'quiet hours'];
    return n[day % n.length];
  };

  return (
    <View style={styles.container}>
      <Text variant="display">{format(date, 'EEEE')}</Text>
      <Text variant="body" color={colors.stone} style={styles.dateText}>
        {format(date, 'd MMMM yyyy')}
      </Text>
      <Text variant="cursive" color={colors.stone} style={styles.greeting}>
        {getGreeting()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    paddingHorizontal: layout.screenPaddingH,
  },
  dateText: { marginTop: spacing.xs },
  greeting: { marginTop: spacing.sm },
});
