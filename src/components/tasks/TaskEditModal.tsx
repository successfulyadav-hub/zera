import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Plus, Trash2 } from 'lucide-react-native';
import { Modal, Button, Text, Checkbox } from '@/components/ui';
import { TimePicker } from '@/components/ui';
import { PriorityPicker } from '@/components/tasks/PriorityPicker';
import { type Task, type TaskPriority } from '@/database/queries/tasks';
import { subtasksQuery, type Subtask } from '@/database/queries/subtasks';
import { useTheme } from '@/hooks/useTheme';
import { hapticLight } from '@/utils/haptics';
import { spacing, layout, typeScale } from '@/theme';

interface TaskEditModalProps {
  visible: boolean;
  task: Task | null;
  onSave: (id: string, title: string, priority: TaskPriority, dueTime: string | null) => void;
  onClose: () => void;
}

export function TaskEditModal({ visible, task, onSave, onClose }: TaskEditModalProps) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('none');
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [showTime, setShowTime] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority || 'none');
      setDueTime(task.due_time || null);
      setShowTime(!!task.due_time);
      subtasksQuery.getByTaskId(task.id).then(setSubtasks);
    } else {
      setSubtasks([]);
    }
  }, [task]);

  const handleSave = () => {
    if (!task || !title.trim()) return;
    onSave(task.id, title.trim(), priority, showTime ? dueTime : null);
    onClose();
  };

  const handleAddSubtask = async () => {
    if (!task || !newSubtask.trim()) return;
    hapticLight();
    await subtasksQuery.create(task.id, newSubtask.trim());
    setNewSubtask('');
    setSubtasks(await subtasksQuery.getByTaskId(task.id));
  };

  const handleToggleSubtask = async (id: string, completed: boolean) => {
    hapticLight();
    await subtasksQuery.toggleComplete(id, completed);
    if (task) setSubtasks(await subtasksQuery.getByTaskId(task.id));
  };

  const handleDeleteSubtask = async (id: string) => {
    hapticLight();
    await subtasksQuery.delete(id);
    if (task) setSubtasks(await subtasksQuery.getByTaskId(task.id));
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text variant="bodyMedium" style={styles.label}>Edit Task</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[typeScale.body, styles.input, { color: colors.ink, borderColor: colors.divider }]}
            placeholder="Task title"
            placeholderTextColor={colors.stone}
            autoFocus
            onSubmitEditing={handleSave}
            returnKeyType="done"
          />

          <Text variant="caption" color={colors.stone} style={styles.label}>Priority</Text>
          <PriorityPicker selected={priority} onSelect={setPriority} />

          <View style={styles.timeRow}>
            <TouchableOpacity
              style={styles.timeToggle}
              onPress={() => {
                hapticLight();
                setShowTime(!showTime);
                if (!showTime && !dueTime) setDueTime('09:00');
              }}
              activeOpacity={0.7}
            >
              <Text variant="body" color={showTime ? colors.sage : colors.stone}>
                {showTime ? 'Due time set' : 'Add due time'}
              </Text>
            </TouchableOpacity>
            {showTime && (
              <View style={styles.timePicker}>
                <TimePicker value={dueTime || '09:00'} onChange={setDueTime} label="" />
                <TouchableOpacity onPress={() => { setShowTime(false); setDueTime(null); }}>
                  <X color={colors.stone} size={16} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text variant="caption" color={colors.stone} style={[styles.label, { marginTop: spacing.lg }]}>
            Subtasks ({subtasks.filter(s => s.is_completed).length}/{subtasks.length})
          </Text>

          {subtasks.map((sub) => (
            <View key={sub.id} style={styles.subtaskRow}>
              <Checkbox
                checked={sub.is_completed === 1}
                onCheckedChange={(checked) => handleToggleSubtask(sub.id, checked)}
              />
              <Text
                variant="bodySmall"
                style={[styles.subtaskTitle, sub.is_completed === 1 && { textDecorationLine: 'line-through' }]}
                color={sub.is_completed === 1 ? colors.stone : colors.ink}
              >
                {sub.title}
              </Text>
              <TouchableOpacity onPress={() => handleDeleteSubtask(sub.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Trash2 color={colors.stone} size={14} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addSubtaskRow}>
            <Plus color={colors.stone} size={16} />
            <TextInput
              value={newSubtask}
              onChangeText={setNewSubtask}
              placeholder="Add subtask..."
              placeholderTextColor={colors.stone}
              style={[typeScale.bodySmall, styles.subtaskInput, { color: colors.ink }]}
              onSubmitEditing={handleAddSubtask}
              returnKeyType="done"
            />
          </View>

          <View style={styles.actions}>
            <Button label="Cancel" variant="ghost" onPress={onClose} style={styles.btn} />
            <Button label="Save" onPress={handleSave} style={styles.btn} />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 500 },
  content: {
    paddingVertical: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  timeRow: {
    marginTop: spacing.md,
  },
  timeToggle: {
    paddingVertical: spacing.sm,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  subtaskTitle: {
    flex: 1,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  subtaskInput: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  btn: {
    height: 40,
    paddingHorizontal: spacing.lg,
  },
});
