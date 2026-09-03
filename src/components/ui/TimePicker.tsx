import { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal as RNModal, Pressable, ScrollView, Dimensions } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/theme';
import { formatTime } from '@/utils/dates';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS = ['AM', 'PM'] as const;

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const [h, m] = (value || '09:00').split(':').map(Number);
  const [selHour, setSelHour] = useState(h % 12 || 12);
  const [selMinute, setSelMinute] = useState(Math.round(m / 5) * 5);
  const [selPeriod, setSelPeriod] = useState<'AM' | 'PM'>(h >= 12 ? 'PM' : 'AM');

  const handleConfirm = () => {
    let hour24 = selHour;
    if (selPeriod === 'AM' && hour24 === 12) hour24 = 0;
    if (selPeriod === 'PM' && hour24 !== 12) hour24 += 12;
    const timeStr = `${hour24.toString().padStart(2, '0')}:${selMinute.toString().padStart(2, '0')}`;
    onChange(timeStr);
    setVisible(false);
  };

  const displayText = value ? formatTime(value) : 'Select time';

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, { backgroundColor: colors.surface }]}
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={label || 'Select time'}
      >
        {label && <Text variant="caption" color={colors.stone} style={styles.label}>{label}</Text>}
        <Text variant="body" color={value ? colors.ink : colors.stone}>{displayText}</Text>
      </TouchableOpacity>

      <RNModal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={[styles.dialog, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <Text variant="bodyMedium" align="center" style={styles.title}>Select Time</Text>

            <View style={styles.pickerRow}>
              <View style={styles.column}>
                <Text variant="caption" color={colors.stone} align="center">Hour</Text>
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                  {HOURS.map((hr) => (
                    <TouchableOpacity
                      key={hr}
                      style={[styles.item, selHour === hr && { backgroundColor: colors.sage }]}
                      onPress={() => setSelHour(hr)}
                    >
                      <Text
                        variant="body"
                        align="center"
                        color={selHour === hr ? '#FFFFFF' : colors.ink}
                      >
                        {hr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.column}>
                <Text variant="caption" color={colors.stone} align="center">Min</Text>
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                  {MINUTES.map((min) => (
                    <TouchableOpacity
                      key={min}
                      style={[styles.item, selMinute === min && { backgroundColor: colors.sage }]}
                      onPress={() => setSelMinute(min)}
                    >
                      <Text
                        variant="body"
                        align="center"
                        color={selMinute === min ? '#FFFFFF' : colors.ink}
                      >
                        {min.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.periodColumn}>
                <Text variant="caption" color={colors.stone} align="center">{' '}</Text>
                {PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.periodItem, selPeriod === p && { backgroundColor: colors.sage }]}
                    onPress={() => setSelPeriod(p)}
                  >
                    <Text
                      variant="bodyMedium"
                      align="center"
                      color={selPeriod === p ? '#FFFFFF' : colors.ink}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              <Button label="Cancel" variant="ghost" onPress={() => setVisible(false)} style={styles.btn} />
              <Button label="Confirm" onPress={handleConfirm} style={styles.btn} />
            </View>
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
  label: { marginBottom: 2 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: spacing.xl,
  },
  title: { marginBottom: spacing.lg },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  column: { flex: 1 },
  scroll: { maxHeight: ITEM_HEIGHT * 5 },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  periodColumn: {
    width: 56,
    gap: spacing.sm,
  },
  periodItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btn: { flex: 1 },
});
