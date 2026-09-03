import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Text, Input, TextArea, Button, IconButton, DatePicker, TimePicker } from '@/components/ui';
import { RecurrencePicker, type RecurrenceType } from '@/components/tasks/RecurrencePicker';
import { useReminderStore } from '@/stores/useReminderStore';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { formatDateKey } from '@/utils/dates';
import { scheduleReminderNotification } from '@/utils/notifications';
import { spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewReminderScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const addReminder = useReminderStore((s) => s.addReminder);
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDateKey(new Date()));
  const [time, setTime] = useState('09:00');
  const [recurrence, setRecurrence] = useState<RecurrenceType | null>(null);

  const handleSave = async () => {
    if (!title.trim()) return;
    await addReminder({
      title: title.trim(),
      description: description.trim() || null,
      date,
      time,
      notify_before: 0,
      is_recurring: recurrence ? 1 : 0,
      recurrence_type: recurrence,
      recurrence_end_date: null,
      is_active: 1,
    });

    await scheduleReminderNotification(
      'new',
      title.trim(),
      description.trim() || null,
      date,
      time,
    );

    toast.show('Reminder set');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <IconButton icon={<X color={colors.ink} size={22} />} onPress={() => router.back()} />
        <Text variant="bodyMedium">New Reminder</Text>
        <Button label="Save" onPress={handleSave} style={styles.saveBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input placeholder="Reminder title" value={title} onChangeText={setTitle} autoFocus />
        <View style={styles.field}>
          <DatePicker value={date} onChange={setDate} label="Date" />
        </View>
        <View style={styles.field}>
          <TimePicker value={time} onChange={setTime} label="Time" />
        </View>
        <View style={styles.field}>
          <Text variant="caption" color={colors.stone} style={styles.fieldLabel}>Repeat</Text>
          <RecurrencePicker selected={recurrence} onSelect={setRecurrence} />
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
  fieldLabel: { marginBottom: spacing.sm },
  saveBtn: { height: 36, paddingHorizontal: spacing.lg },
});
