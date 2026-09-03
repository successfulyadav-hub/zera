import { View, StyleSheet, Modal as RNModal, Pressable } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors } = useTheme();

  return (
    <RNModal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={[styles.dialog, { backgroundColor: colors.surface }]} onPress={() => {}}>
          <Text variant="bodyMedium" style={styles.title}>{title}</Text>
          <Text variant="body" color={colors.stone} style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button label={cancelLabel} variant="ghost" onPress={onCancel} style={styles.btn} />
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              style={[styles.btn, destructive && { backgroundColor: colors.error }]}
            />
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: spacing.xl,
  },
  title: { marginBottom: spacing.sm },
  message: { marginBottom: spacing.xl },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  btn: { flex: 1 },
});
