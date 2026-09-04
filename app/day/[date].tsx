import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { DayHeader } from '@/components/today/DayHeader';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { ScheduleTimeline } from '@/components/today/ScheduleTimeline';
import { TaskSection } from '@/components/today/TaskSection';
import { NotePreview } from '@/components/today/NotePreview';
import { TaskEditModal } from '@/components/tasks/TaskEditModal';
import { IconButton } from '@/components/ui';
import { useTaskStore } from '@/stores/useTaskStore';
import { useEventStore } from '@/stores/useEventStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useUndoToast } from '@/hooks/useUndoToast';
import { parseDate, formatDateKey, getNextDay, getPrevDay } from '@/utils/dates';
import { spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticLight } from '@/utils/haptics';
import { scheduleTaskNotification } from '@/utils/notifications';
import { tasksQuery, type Task, type TaskPriority } from '@/database/queries/tasks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 60;

export default function DayScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const undoToast = useUndoToast();

  const flipProgress = useSharedValue(0);
  const opacity = useSharedValue(1);

  const [currentDate, setCurrentDate] = useState(() =>
    parseDate(dateParam || formatDateKey(new Date())),
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const dateString = formatDateKey(currentDate);

  const { tasks, loadTasks, addTask, toggleComplete, deleteTask, updatePriority } =
    useTaskStore();
  const { events, loadEvents } = useEventStore();
  const { notes, loadNotes } = useNoteStore();

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTasks(dateString), loadEvents(dateString), loadNotes(dateString)]).then(() => {
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [dateString]);

  const flipTo = (direction: 'next' | 'prev') => {
    'worklet';
    const target = direction === 'next' ? -1 : 1;
    flipProgress.value = withSequence(
      withTiming(target, { duration: 250 }),
      withTiming(0, { duration: 0 }),
    );
    opacity.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1, { duration: 200 }),
    );
  };

  const goNext = () => {
    hapticLight();
    setCurrentDate((d) => getNextDay(d));
  };

  const goPrev = () => {
    hapticLight();
    setCurrentDate((d) => getPrevDay(d));
  };

  const swipe = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      flipProgress.value = interpolate(
        e.translationX,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-1, 0, 1],
        Extrapolation.CLAMP,
      );
      opacity.value = interpolate(
        Math.abs(e.translationX),
        [0, SCREEN_WIDTH * 0.4],
        [1, 0.3],
        Extrapolation.CLAMP,
      );
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(goNext)();
      } else if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(goPrev)();
      }
      flipProgress.value = withTiming(0, { duration: 250 });
      opacity.value = withTiming(1, { duration: 250 });
    });

  const pageStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [-1, 0, 1],
      [-18, 0, 18],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      Math.abs(flipProgress.value),
      [0, 1],
      [1, 0.92],
      Extrapolation.CLAMP,
    );
    const translateX = interpolate(
      flipProgress.value,
      [-1, 0, 1],
      [-SCREEN_WIDTH * 0.15, 0, SCREEN_WIDTH * 0.15],
      Extrapolation.CLAMP,
    );

    return {
      opacity: opacity.value,
      transform: [
        { perspective: 1200 },
        { translateX },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
    };
  });

  const handleEditSave = async (
    id: string,
    title: string,
    priority: TaskPriority,
    dueTime: string | null,
  ) => {
    await tasksQuery.updateTitle(id, title);
    await tasksQuery.updateDueTime(id, dueTime);
    await updatePriority(id, priority, dateString);
    if (dueTime) scheduleTaskNotification(id, title, dateString, dueTime);
    toast.show('Task updated');
  };

  const todaysNote = notes.length > 0 ? notes[0] : undefined;

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <IconButton
          icon={<ArrowLeft color={colors.ink} size={22} />}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <View style={styles.navRow}>
          <IconButton
            icon={<ChevronLeft color={colors.ink} size={22} />}
            onPress={() => {
              flipTo('prev');
              goPrev();
            }}
            size={36}
            accessibilityLabel="Previous day"
          />
          <IconButton
            icon={<ChevronRight color={colors.ink} size={22} />}
            onPress={() => {
              flipTo('next');
              goNext();
            }}
            size={36}
            accessibilityLabel="Next day"
          />
        </View>
      </View>
      <GestureDetector gesture={swipe}>
        <Animated.View style={[styles.page, pageStyle]}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <DayHeader date={currentDate} />
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
              onToggleTask={(id, isCompleted) =>
                toggleComplete(id, isCompleted, dateString)
              }
              onAddTask={(title, priority) =>
                addTask(title, dateString, priority)
              }
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
            </>
            )}
          </ScrollView>
        </Animated.View>
      </GestureDetector>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.sm,
  },
  navRow: { flexDirection: 'row', gap: spacing.xs },
  page: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: { paddingBottom: 100 },
});
