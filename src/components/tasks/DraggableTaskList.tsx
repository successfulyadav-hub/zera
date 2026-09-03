import { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { TaskItem } from './TaskItem';
import { type Task } from '@/database/queries/tasks';
import { useTheme } from '@/hooks/useTheme';
import { hapticMedium } from '@/utils/haptics';

const ITEM_HEIGHT = 52;

interface DraggableTaskListProps {
  tasks: Task[];
  onToggle: (id: string, isCompleted: boolean) => void;
  onReorder: (ids: string[]) => void;
}

export function DraggableTaskList({ tasks, onToggle, onReorder }: DraggableTaskListProps) {
  const { colors } = useTheme();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragY = useSharedValue(0);
  const dragIndex = useSharedValue(-1);
  const currentIndex = useSharedValue(-1);

  const commitReorder = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const ids = tasks.map((t) => t.id);
    const [moved] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, moved);
    onReorder(ids);
  }, [tasks, onReorder]);

  const startDrag = useCallback((id: string) => {
    hapticMedium();
    setDraggingId(id);
  }, []);

  const endDrag = useCallback(() => {
    setDraggingId(null);
  }, []);

  return (
    <View style={styles.container}>
      {tasks.map((task, index) => {
        const isDragging = task.id === draggingId;

        return (
          <View
            key={task.id}
            style={[
              styles.item,
              isDragging && { opacity: 0.5, backgroundColor: colors.surface },
            ]}
          >
            <TaskItem
              task={task}
              onToggle={onToggle}
              drag={() => startDrag(task.id)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  item: {
    borderRadius: 8,
  },
});
