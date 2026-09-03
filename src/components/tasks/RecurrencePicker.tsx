import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';
import { hapticSelection } from '@/utils/haptics';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const RECURRENCE_OPTIONS: { value: RecurrenceType | null; label: string }[] = [
  { value: null, label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

interface RecurrencePickerProps {
  selected: RecurrenceType | null;
  onSelect: (value: RecurrenceType | null) => void;
}

export function RecurrencePicker({ selected, onSelect }: RecurrencePickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {RECURRENCE_OPTIONS.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.label}
            onPress={() => { hapticSelection(); onSelect(opt.value); }}
            activeOpacity={0.7}
            style={[
              styles.chip,
              { borderColor: isSelected ? colors.sage : colors.divider },
              isSelected && { backgroundColor: colors.sageSoft },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <Text variant="caption" color={isSelected ? colors.sage : colors.stone}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
  },
});
