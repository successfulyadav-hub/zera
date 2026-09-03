import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui';
import { type TaskPriority } from '@/database/queries/tasks';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';
import { hapticSelection } from '@/utils/haptics';

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'none', label: 'None', color: '#8C8780' },
  { value: 'low', label: 'Low', color: '#6B9BC3' },
  { value: 'medium', label: 'Med', color: '#C4A46B' },
  { value: 'high', label: 'High', color: '#BF6B5A' },
];

interface PriorityPickerProps {
  selected: TaskPriority;
  onSelect: (priority: TaskPriority) => void;
}

export function PriorityPicker({ selected, onSelect }: PriorityPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {PRIORITIES.map((p) => {
        const isSelected = selected === p.value;
        return (
          <TouchableOpacity
            key={p.value}
            onPress={() => { hapticSelection(); onSelect(p.value); }}
            activeOpacity={0.7}
            style={[
              styles.chip,
              { borderColor: isSelected ? p.color : colors.divider },
              isSelected && { backgroundColor: p.color + '18' },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${p.label} priority`}
          >
            {p.value !== 'none' && (
              <View style={[styles.dot, { backgroundColor: p.color }]} />
            )}
            <Text
              variant="caption"
              color={isSelected ? p.color : colors.stone}
            >
              {p.label}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
