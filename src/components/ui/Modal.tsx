import { Modal as RNModal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, children }: ModalProps) {
  const { colors } = useTheme();
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, { backgroundColor: colors.surface }]}>{children}</View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  content: {
    width: '100%',
    borderRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
});
