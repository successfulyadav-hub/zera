import { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Text, Input, TextArea, Button, IconButton, DatePicker, TimePicker, ColorPicker } from '@/components/ui';
import { useEventStore } from '@/stores/useEventStore';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { formatDateKey } from '@/utils/dates';
import { spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewEventScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const addEvent = useEventStore((s) => s.addEvent);
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDateKey(new Date()));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [color, setColor] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) return;
    await addEvent({
      title: title.trim(),
      description: description.trim() || null,
      date,
      start_time: isAllDay ? null : startTime,
      end_time: isAllDay ? null : endTime,
      is_all_day: isAllDay ? 1 : 0,
      color,
    });
    toast.show('Event created');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <IconButton icon={<X color={colors.ink} size={22} />} onPress={() => router.back()} />
        <Text variant="bodyMedium">New Event</Text>
        <Button label="Save" onPress={handleSave} style={styles.saveBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input placeholder="Event title" value={title} onChangeText={setTitle} autoFocus />

        <View style={styles.field}>
          <DatePicker value={date} onChange={setDate} label="Date" />
        </View>

        <View style={[styles.row, styles.field]}>
          <Text variant="body">All Day</Text>
          <Switch value={isAllDay} onValueChange={setIsAllDay} trackColor={{ false: colors.surface, true: colors.sage }} thumbColor="#FFF" />
        </View>

        {!isAllDay && (
          <View style={[styles.row, styles.field]}>
            <View style={styles.timeInput}>
              <TimePicker value={startTime} onChange={setStartTime} label="Start" />
            </View>
            <Text variant="body" color={colors.stone}> — </Text>
            <View style={styles.timeInput}>
              <TimePicker value={endTime} onChange={setEndTime} label="End" />
            </View>
          </View>
        )}

        <View style={styles.field}>
          <ColorPicker value={color} onChange={setColor} />
        </View>

        <TextArea placeholder="Description (optional)" value={description} onChangeText={setDescription} style={styles.field} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH, paddingVertical: spacing.sm,
  },
  content: { paddingHorizontal: layout.screenPaddingH, paddingTop: spacing.lg, paddingBottom: 50 },
  field: { marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeInput: { flex: 1 },
  saveBtn: { height: 36, paddingHorizontal: spacing.lg },
});
