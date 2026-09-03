import { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, ListChecks } from 'lucide-react-native';
import { Text, Checkbox } from '@/components/ui';
import { type Task, type TaskPriority } from '@/database/queries/tasks';
import { spacing, layout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatTime } from '@/utils/dates';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const PRIORITY_COLORS: Record<TaskPriority, string | null> = {
  none: null,
  low: '#6B9BC3',
  medium: '#C4A46B',
  high: '#BF6B5A',
};

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, isCompleted: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  drag?: () => void;
  isActive?: boolean;
  subtaskCount?: { total: number; completed: number };
}

export const TaskItem = memo(function TaskItem({ task, onToggle, onEdit, drag, isActive, subtaskCount }: TaskItemProps) {
  const isCompleted = task.is_completed === 1;
  const { colors } = useTheme();
  const priorityColor = PRIORITY_COLORS[task.priority || 'none'];
  const hasSubtasks = subtaskCount && subtaskCount.total > 0;
  const hasDueTime = !!task.due_time;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isCompleted ? 0.5 : 1, { duration: 300 }),
  }));

  return (
    <Animated.View
      style={[styles.container, animatedStyle, isActive && { backgroundColor: colors.surface }]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isCompleted }}
      accessibilityLabel={`${task.title}${task.priority !== 'none' ? `, ${task.priority} priority` : ''}${hasDueTime ? `, due at ${task.due_time}` : ''}`}
    >
      {priorityColor && (
        <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
      )}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={(checked) => onToggle(task.id, checked)}
      />
      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.7}
        onPress={() => onEdit ? onEdit(task) : onToggle(task.id, !isCompleted)}
        onLongPress={drag}
        delayLongPress={200}
      >
        <Text
          variant="body"
          color={isCompleted ? colors.stone : colors.ink}
          style={{ textDecorationLine: isCompleted ? 'line-through' : 'none' }}
        >
          {task.title}
        </Text>
        {(hasSubtasks || hasDueTime) && (
          <View style={styles.meta}>
            {hasDueTime && (
              <View style={styles.metaItem}>
                <Clock color={colors.stone} size={12} />
                <Text variant="caption" color={colors.stone}>{formatTime(task.due_time!)}</Text>
              </View>
            )}
            {hasSubtasks && (
              <View style={styles.metaItem}>
                <ListChecks color={colors.stone} size={12} />
                <Text variant="caption" color={colors.stone}>
                  {subtaskCount.completed}/{subtaskCount.total}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: layout.screenPaddingH,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
