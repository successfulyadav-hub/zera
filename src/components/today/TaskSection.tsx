import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui';
import { TaskItem } from '@/components/tasks/TaskItem';
import { SwipeableTaskItem } from '@/components/tasks/SwipeableTaskItem';
import { PriorityPicker } from '@/components/tasks/PriorityPicker';
import { type Task, type TaskPriority } from '@/database/queries/tasks';
import { subtasksQuery } from '@/database/queries/subtasks';
import { spacing, layout, typeScale } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react-native';

interface TaskSectionProps {
  tasks: Task[];
  onToggleTask: (id: string, isCompleted: boolean) => void;
  onAddTask: (title: string, priority?: TaskPriority) => void;
  onDeleteTask?: (id: string) => void;
  onEditTask?: (task: Task) => void;
  swipeable?: boolean;
}

export function TaskSection({ tasks, onToggleTask, onAddTask, onDeleteTask, onEditTask, swipeable }: TaskSectionProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('none');
  const [showPriority, setShowPriority] = useState(false);
  const [subtaskCounts, setSubtaskCounts] = useState<Record<string, { total: number; completed: number }>>({});
  const { colors } = useTheme();

  useEffect(() => {
    const ids = tasks.map(t => t.id);
    if (ids.length > 0) {
      subtasksQuery.getCountsByTaskIds(ids).then(setSubtaskCounts);
    } else {
      setSubtaskCounts({});
    }
  }, [tasks]);

  const handleAdd = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), priority);
      setNewTaskTitle('');
      setPriority('none');
      setShowPriority(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="sectionLabel" color={colors.stone} style={{ textTransform: 'uppercase' }}>
          Tasks
        </Text>
      </View>

      <View style={styles.list}>
        {tasks.map((task) =>
          swipeable && onDeleteTask ? (
            <SwipeableTaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
              subtaskCount={subtaskCounts[task.id]}
            />
          ) : (
            <TaskItem key={task.id} task={task} onToggle={onToggleTask} onEdit={onEditTask} subtaskCount={subtaskCounts[task.id]} />
          )
        )}
      </View>

      <View style={styles.inputRow}>
        <Plus color={colors.stone} size={20} />
        <TextInput
          style={[styles.input, typeScale.body, { color: colors.ink }]}
          placeholder="Add a task..."
          placeholderTextColor={colors.stone}
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={() => setShowPriority(!showPriority)} activeOpacity={0.7}>
          {showPriority ? (
            <ChevronUp color={colors.stone} size={18} />
          ) : (
            <ChevronDown color={colors.stone} size={18} />
          )}
        </TouchableOpacity>
      </View>

      {showPriority && (
        <View style={styles.priorityRow}>
          <PriorityPicker selected={priority} onSelect={setPriority} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    marginBottom: spacing.md,
  },
  list: { marginBottom: spacing.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  priorityRow: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.sm,
  },
});
