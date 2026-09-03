import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { Text, Input, TextArea, Button, IconButton, ConfirmDialog, DatePicker, TimePicker, ColorPicker } from '@/components/ui';
import { useEventStore } from '@/stores/useEventStore';
import { useToast } from '@/hooks/useToast';
import { useUndoToast } from '@/hooks/useUndoToast';
import { eventsQuery, type Event } from '@/database/queries/events';
import { useTheme } from '@/hooks/useTheme';
import { spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { updateEvent, deleteEvent } = useEventStore();
  const toast = useToast();
  const undoToast = useUndoToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [color, setColor] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    if (id) {
      eventsQuery.getById(id).then((e) => {
        if (e) {
          setEvent(e);
          setTitle(e.title);
          setDescription(e.description || '');
          setDate(e.date);
          setStartTime(e.start_time || '09:00');
          setEndTime(e.end_time || '10:00');
          setIsAllDay(e.is_all_day === 1);
          setColor(e.color || null);
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!title.trim() || !event) return;
    await updateEvent(event.id, {
      title: title.trim(),
      description: description.trim() || null,
      date,
      start_time: isAllDay ? null : startTime,
      end_time: isAllDay ? null : endTime,
      is_all_day: isAllDay ? 1 : 0,
      color,
    }, date);
    toast.show('Event saved');
    router.back();
  };

  const handleDelete = async () => {
    if (!event) return;
    setConfirmVisible(false);
    const deleted = { ...event };
    await deleteEvent(event.id, event.date);
    router.back();
    undoToast.show('Event deleted', async () => {
      const { id: _id, ...rest } = deleted;
      await eventsQuery.create(rest);
    });
  };

  if (!event) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <IconButton icon={<X color={colors.ink} size={22} />} onPress={() => router.back()} />
        <Text variant="bodyMedium">Edit Event</Text>
        <Button label="Save" onPress={handleSave} style={styles.saveBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input placeholder="Event title" value={title} onChangeText={setTitle} />

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

        <TextArea placeholder="Description" value={description} onChangeText={setDescription} style={styles.field} />
        <Button
          label="Delete Event"
          variant="ghost"
          onPress={() => setConfirmVisible(true)}
          style={[styles.deleteBtn, { borderColor: colors.error }]}
        />
      </ScrollView>

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete Event"
        message="This event will be permanently removed."
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeInput: { flex: 1 },
  saveBtn: { height: 36, paddingHorizontal: spacing.lg },
  deleteBtn: { marginTop: spacing.xxl },
});
