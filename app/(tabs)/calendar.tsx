import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { addMonths, subMonths, isToday as checkIsToday } from 'date-fns';
import { SwipeableCalendar } from '@/components/calendar/SwipeableCalendar';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ScheduleTimeline } from '@/components/today/ScheduleTimeline';
import { TaskSection } from '@/components/today/TaskSection';
import { TaskEditModal } from '@/components/tasks/TaskEditModal';
import { IconButton, Text } from '@/components/ui';
import { useEventStore } from '@/stores/useEventStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { eventsQuery } from '@/database/queries/events';
import { tasksQuery, type Task, type TaskPriority } from '@/database/queries/tasks';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useUndoToast } from '@/hooks/useUndoToast';
import { useSync } from '@/hooks/useSync';
import { formatDateKey, friendlyDate, getMonthYear } from '@/utils/dates';
import { spacing, layout } from '@/theme';
import { hapticLight } from '@/utils/haptics';
import { scheduleTaskNotification } from '@/utils/notifications';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const undoToast = useUndoToast();
  const { triggerSync } = useSync();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventDots, setEventDots] = useState<Set<string>>(new Set());
  const [taskDots, setTaskDots] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const dateString = formatDateKey(selectedDate);
  const { events, loadEvents } = useEventStore();
  const { tasks, loadTasks, addTask, toggleComplete, deleteTask, updatePriority } = useTaskStore();

  useFocusEffect(
    useCallback(() => {
      loadEvents(dateString);
      loadTasks(dateString);
    }, [dateString])
  );

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    eventsQuery.getByMonth(year, month).then((data) => {
      setEventDots(new Set(data.map((d) => d.date)));
    });
    tasksQuery.getByMonth(year, month).then((data) => {
      setTaskDots(new Set(data.map((d) => d.date)));
    });
  }, [currentMonth]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    const key = formatDateKey(date);
    loadEvents(key);
    loadTasks(key);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await triggerSync();
    loadEvents(dateString);
    loadTasks(dateString);
    setRefreshing(false);
    toast.show('Synced');
  }, [triggerSync, dateString]);

  const jumpToToday = () => {
    hapticLight();
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    const key = formatDateKey(today);
    loadEvents(key);
    loadTasks(key);
  };

  const handleEditSave = async (id: string, title: string, priority: TaskPriority, dueTime: string | null) => {
    await tasksQuery.updateTitle(id, title);
    await tasksQuery.updateDueTime(id, dueTime);
    await updatePriority(id, priority, dateString);
    if (dueTime) scheduleTaskNotification(id, title, dateString, dueTime);
    toast.show('Task updated');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenHeader title="Calendar" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.sage}
            colors={[colors.sage]}
          />
        }
      >
        <View style={styles.monthNav}>
          <IconButton
            icon={<ChevronLeft color={colors.ink} size={22} />}
            onPress={() => setCurrentMonth((m) => subMonths(m, 1))}
            size={36}
          />
          <TouchableOpacity onPress={jumpToToday} activeOpacity={0.7}>
            <Text variant="bodyMedium">{getMonthYear(currentMonth)}</Text>
          </TouchableOpacity>
          <IconButton
            icon={<ChevronRight color={colors.ink} size={22} />}
            onPress={() => setCurrentMonth((m) => addMonths(m, 1))}
            size={36}
          />
        </View>

        <SwipeableCalendar
          month={currentMonth}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onOpenDay={(d) => router.push(`/day/${formatDateKey(d)}`)}
          onPrevMonth={() => setCurrentMonth((m) => subMonths(m, 1))}
          onNextMonth={() => setCurrentMonth((m) => addMonths(m, 1))}
          eventDots={eventDots}
          taskDots={taskDots}
        />

        <View style={styles.daySection}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/day/${dateString}`)}>
            <Text variant="bodyMedium" color={colors.sage} style={styles.dayLabel}>
              {friendlyDate(selectedDate)}
            </Text>
          </TouchableOpacity>
          <ScheduleTimeline events={events} />
          <TaskSection
            tasks={tasks}
            onToggleTask={(id, isCompleted) => toggleComplete(id, isCompleted, dateString)}
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
        </View>
      </ScrollView>

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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.md,
  },
  daySection: { paddingTop: spacing.xl },
  dayLabel: {
    paddingHorizontal: layout.screenPaddingH,
    marginBottom: spacing.md,
  },
});
