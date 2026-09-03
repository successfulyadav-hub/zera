import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

interface UndoToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  onUndo: () => void;
  duration?: number;
}

export function UndoToast({ message, visible, onHide, onUndo, duration = 4000 }: UndoToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withDelay(duration, withTiming(100, { duration: 300 }));
      opacity.value = withDelay(duration, withTiming(0, { duration: 300 }, () => {
        runOnJS(onHide)();
      }));
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.ink, bottom: insets.bottom + spacing.lg },
        animatedStyle,
      ]}
    >
      <Text variant="bodySmall" color={colors.bg} style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onUndo} activeOpacity={0.7} hitSlop={8}>
        <Text variant="bodySmall" color={colors.sage} style={styles.undoText}>Undo</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    zIndex: 9999,
  },
  message: { flex: 1 },
  undoText: { fontWeight: '700', marginLeft: spacing.md },
});
