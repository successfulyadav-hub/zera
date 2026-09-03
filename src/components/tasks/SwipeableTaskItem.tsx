import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { TaskItem } from './TaskItem';
import { type Task } from '@/database/queries/tasks';
import { useTheme } from '@/hooks/useTheme';
import { hapticMedium } from '@/utils/haptics';

const DELETE_THRESHOLD = -80;

interface SwipeableTaskItemProps {
  task: Task;
  onToggle: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
  subtaskCount?: { total: number; completed: number };
}

export function SwipeableTaskItem({ task, onToggle, onDelete, onEdit, subtaskCount }: SwipeableTaskItemProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);

  const handleDelete = () => {
    hapticMedium();
    onDelete(task.id);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -120);
      }
    })
    .onEnd((e) => {
      if (e.translationX < DELETE_THRESHOLD) {
        translateX.value = withTiming(-400, { duration: 200 });
        runOnJS(handleDelete)();
      } else {
        translateX.value = withTiming(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: withTiming(translateX.value < -20 ? 1 : 0, { duration: 150 }),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.deleteBackground, { backgroundColor: colors.error }, bgStyle]}>
        <View style={styles.deleteIcon}>
          <Trash2 color="#FFFFFF" size={20} />
        </View>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.foreground, { backgroundColor: colors.bg }, rowStyle]}>
          <TaskItem task={task} onToggle={onToggle} onEdit={onEdit} subtaskCount={subtaskCount} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  deleteBackground: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  deleteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foreground: {},
});
