import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { Text, Input, TextArea, Button, IconButton, ConfirmDialog, DatePicker, TimePicker } from '@/components/ui';
import { RecurrencePicker, type RecurrenceType } from '@/components/tasks/RecurrencePicker';
import { useReminderStore } from '@/stores/useReminderStore';
import { useToast } from '@/hooks/useToast';
import { useUndoToast } from '@/hooks/useUndoToast';
import { remindersQuery, type Reminder } from '@/database/queries/reminders';
import { scheduleReminderNotification } from '@/utils/notifications';
import { useTheme } from '@/hooks/useTheme';
import { spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { updateReminder, deleteReminder } = useReminderStore();
  const toast = useToast();
  const undoToast = useUndoToast();

  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    if (id) {
      remindersQuery.getById(id).then((r) => {
        if (r) {
          setReminder(r);
          setTitle(r.title);
          setDescription(r.description || '');
          setDate(r.date);
          setTime(r.time);
          setRecurrence((r.recurrence_type as RecurrenceType) || null);
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!title.trim() || !reminder) return;
    await updateReminder(reminder.id, {
      title: title.trim(),
      description: description.trim() || null,
      date,
      time,
      is_recurring: recurrence ? 1 : 0,
      recurrence_type: recurrence,
    }, date);

    await scheduleReminderNotification(
      reminder.id,
      title.trim(),
      description.trim() || null,
      date,
      time,
    );

    toast.show('Reminder updated');
    router.back();
  };

  const handleDelete = async () => {
    if (!reminder) return;
    setConfirmVisible(false);
    const deleted = { ...reminder };
    await deleteReminder(reminder.id, reminder.date);
    router.back();
    undoToast.show('Reminder deleted', async () => {
      const { id: _id, ...rest } = deleted;
      await remindersQuery.create(rest);
    });
  };

  if (!reminder) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <IconButton icon={<X color={colors.ink} size={22} />} onPress={() => router.back()} />
        <Text variant="bodyMedium">Edit Reminder</Text>
        <Button label="Save" onPress={handleSave} style={styles.saveBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input placeholder="Reminder title" value={title} onChangeText={setTitle} />
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
        <TextArea placeholder="Description" value={description} onChangeText={setDescription} style={styles.field} />
        <Button
          label="Delete Reminder"
          variant="ghost"
          onPress={() => setConfirmVisible(true)}
          style={[styles.deleteBtn, { borderColor: colors.error }]}
        />
      </ScrollView>

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete Reminder"
        message="This reminder will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
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
  deleteBtn: { marginTop: spacing.xxl },
});
