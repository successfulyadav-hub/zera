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
    const month = new Date().getMonth();
    const seed = day + month * 31;

    if (hour >= 5 && hour < 12) {
      const m = [
        'rise and create', 'main character energy', 'clock it today',
        'new day, new slay', 'morning era', 'built different',
        'fresh start energy', 'let’s get it', 'soft launch your day',
        'it’s giving morning', 'glow up starts now', 'no cap, you got this',
        'that girl morning', 'manifesting greatness', 'brighter than yesterday',
        'vibes are immaculate', 'pour into yourself', 'this is your sign',
      ];
      return m[seed % m.length];
    }
    if (hour >= 12 && hour < 17) {
      const a = [
        'keep flowing', 'ate and left no crumbs', 'locked in',
        'in my productive era', 'understood the assignment', 'steady grind',
        'doing the work', 'main event energy', 'stay focused, stay lit',
        'momentum is everything', 'trust the process', 'feelin’ it',
        'this hits different', 'living my truth', 'stay golden',
        'you’re lowkey crushing it', 'keep that energy', 'big moves only',
      ];
      return a[seed % a.length];
    }
    if (hour >= 17 && hour < 21) {
      const e = [
        'golden hour', 'soft life vibes', 'winding down gracefully',
        'you did that', 'evening glow', 'rest is productive too',
        'unwinding era', 'peace and quiet hits', 'sunset state of mind',
        'recharged and blessed', 'cozy mode activated', 'you earned this',
        'breathe, you made it', 'reflect and reset', 'good things take time',
        'be proud of today', 'stillness is power', 'gentle reminder: you’re enough',
      ];
      return e[seed % e.length];
    }
    const n = [
      'quiet hours', 'night owl energy', 'dream big tonight',
      'rest is sacred', 'recharging', 'stars are out, so are you',
      'sleep on it', 'tomorrow’s a new chapter', 'soft reset loading',
      'late night thoughts', 'wind down, level up', 'let it go',
      'healing happens here', 'the night is yours', 'plot twist: rest wins',
      'signed off for the day', 'moonlit mindset', 'permission to chill',
    ];
    return n[seed % n.length];
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
