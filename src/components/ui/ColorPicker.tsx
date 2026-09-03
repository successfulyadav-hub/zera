import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

const EVENT_COLORS = [
  { name: 'Sage', value: '#7B8F7A' },
  { name: 'Sky', value: '#6B9BC3' },
  { name: 'Lavender', value: '#9B8EC4' },
  { name: 'Rose', value: '#C47B8B' },
  { name: 'Amber', value: '#C4A46B' },
  { name: 'Coral', value: '#BF6B5A' },
  { name: 'Teal', value: '#5BA3A3' },
  { name: 'Stone', value: '#8C8780' },
];

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.stone} style={styles.label}>Color</Text>
      <View style={styles.row}>
        {EVENT_COLORS.map((c) => {
          const selected = value === c.value;
          return (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.swatch,
                { backgroundColor: c.value },
                selected && styles.selected,
              ]}
              onPress={() => onChange(selected ? null : c.value)}
              accessibilityRole="button"
              accessibilityLabel={`${c.name} color${selected ? ', selected' : ''}`}
            >
              {selected && <Check color="#FFFFFF" size={14} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
