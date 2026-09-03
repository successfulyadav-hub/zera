import { useState, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Search, Calendar, FileText, Bell } from 'lucide-react-native';
import { DayHeader } from '@/components/today/DayHeader';
import { WeekStrip } from '@/components/today/WeekStrip';
import { ScheduleTimeline } from '@/components/today/ScheduleTimeline';
import { TaskSection } from '@/components/today/TaskSection';
import { NotePreview } from '@/components/today/NotePreview';
import { DailyStats } from '@/components/today/DailyStats';
import { StreakBadge } from '@/components/today/StreakBadge';
import { CompletionBanner } from '@/components/today/CompletionBanner';
import { WeeklyInsights } from '@/components/today/WeeklyInsights';
import { TaskEditModal } from '@/components/tasks/TaskEditModal';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { FAB } from '@/components/shared/FAB';
import { IconButton, BottomSheet, Text } from '@/components/ui';
import { useTaskStore } from '@/stores/useTaskStore';
import { useEventStore } from '@/stores/useEventStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { useTheme } from '@/hooks/useTheme';
import { useSync } from '@/hooks/useSync';
import { useToast } from '@/hooks/useToast';
import { useUndoToast } from '@/hooks/useUndoToast';
import { formatDateKey } from '@/utils/dates';
import { spacing, layout } from '@/theme';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { scheduleTaskNotification } from '@/utils/notifications';
import { type Task, type TaskPriority } from '@/database/queries/tasks';
import { tasksQuery } from '@/database/queries/tasks';

export default function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = formatDateKey(selectedDate);
  const { colors } = useTheme();
  const router = useRouter();
  const [fabOpen, setFabOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);
  const toast = useToast();
  const undoToast = useUndoToast();

  const { tasks, loadTasks, addTask, toggleComplete, deleteTask, updatePriority, streak, loadStreak } = useTaskStore();
  const { events, loadEvents } = useEventStore();
  const { notes, loadNotes } = useNoteStore();
  const { triggerSync } = useSync();

  const reload = useCallback(async () => {
    await Promise.all([
      loadTasks(dateString),
      loadEvents(dateString),
      loadNotes(dateString),
      loadStreak(),
    ]);
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      setLoading(false);
    }
  }, [dateString]);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await triggerSync();
    reload();
    setRefreshing(false);
    toast.show('Synced');
  }, [triggerSync, reload]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const key = formatDateKey(date);
    loadTasks(key);
    loadEvents(key);
    loadNotes(key);
  };

  const handleToggle = (id: string, isCompleted: boolean) => {
    toggleComplete(id, isCompleted, dateString);
    if (isCompleted) {
      const remainingIncomplete = tasks.filter((t) => t.id !== id && t.is_completed === 0);
      if (remainingIncomplete.length === 0 && tasks.length > 0) {
        hapticSuccess();
      }
    }
  };

  const handleEditSave = async (id: string, title: string, priority: TaskPriority, dueTime: string | null) => {
    await tasksQuery.updateTitle(id, title);
    await tasksQuery.updateDueTime(id, dueTime);
    await updatePriority(id, priority, dateString);
    if (dueTime) scheduleTaskNotification(id, title, dateString, dueTime);
    toast.show('Task updated');
  };

  const todaysNote = notes.length > 0 ? notes[0] : undefined;
  const allDone = tasks.length > 0 && tasks.every((t) => t.is_completed === 1);

  const fabActions = [
    { icon: Calendar, label: 'Event', onPress: () => { setFabOpen(false); router.push('/event/new'); } },
    { icon: FileText, label: 'Note', onPress: () => { setFabOpen(false); router.push(`/note/new?date=${dateString}`); } },
    { icon: Bell, label: 'Reminder', onPress: () => { setFabOpen(false); router.push('/reminder/new'); } },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenHeader
        title=""
        right={
          <IconButton
            icon={<Search color={colors.stone} size={22} />}
            onPress={() => router.push('/search')}
          />
        }
      />

      <WeekStrip selectedDate={selectedDate} onSelectDate={handleDateSelect} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.sage}
            colors={[colors.sage]}
          />
        }
      >
        <DayHeader date={selectedDate} />
        <View style={{ paddingHorizontal: layout.screenPaddingH, marginBottom: spacing.sm }}>
          <StreakBadge streak={streak} />
        </View>
        <DailyStats
          totalTasks={tasks.length}
          completedTasks={tasks.filter((t) => t.is_completed === 1).length}
          totalEvents={events.length}
        />
        <CompletionBanner visible={allDone} />
        {loading ? (
          <View style={{ paddingHorizontal: layout.screenPaddingH }}>
            <ListSkeleton count={2} type="event" />
            <View style={{ height: spacing.lg }} />
            <ListSkeleton count={3} type="task" />
          </View>
        ) : (
          <>
        <ScheduleTimeline events={events} />
        <TaskSection
          tasks={tasks}
          onToggleTask={handleToggle}
          onAddTask={(title, priority) => addTask(title, dateString, priority)}
          onDeleteTask={(id) => {
            const deletedTask = tasks.find((t) => t.id === id);
            deleteTask(id, dateString);
            if (deletedTask) {
              undoToast.show('Task deleted', () => {
                addTask(deletedTask.title, dateString, deletedTask.priority);
              });
            }
          }}
          onEditTask={setEditingTask}
          swipeable
        />
        <NotePreview note={todaysNote} date={dateString} />
        <View style={{ paddingHorizontal: layout.screenPaddingH }}>
          <WeeklyInsights />
        </View>
          </>
        )}
      </ScrollView>

      <FAB onPress={() => setFabOpen(true)} />

      <BottomSheet visible={fabOpen} onClose={() => setFabOpen(false)}>
        <Text variant="sectionLabel" color={colors.stone} style={styles.sheetTitle}>CREATE</Text>
        {fabActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.sheetItem}
            activeOpacity={0.7}
            onPress={() => { hapticLight(); action.onPress(); }}
          >
            <action.icon color={colors.sage} size={22} />
            <Text variant="bodyMedium" style={styles.sheetLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>

      <TaskEditModal
        visible={!!editingTask}
        task={editingTask}
        onSave={handleEditSave}
        onClose={() => setEditingTask(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 100 },
  sheetTitle: {
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  sheetLabel: { marginLeft: spacing.xs },
});
