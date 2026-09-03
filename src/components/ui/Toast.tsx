import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
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

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info';
}

export function Toast({ message, visible, onHide, duration = 2500, type = 'success' }: ToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withDelay(duration, withTiming(-100, { duration: 300 }));
      opacity.value = withDelay(duration, withTiming(0, { duration: 300 }, () => {
        runOnJS(onHide)();
      }));
    }
  }, [visible]);

  const bgColor = type === 'error' ? colors.error : type === 'info' ? colors.stone : colors.sage;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, top: insets.top + spacing.sm },
        animatedStyle,
      ]}
    >
      <Text variant="bodySmall" color="#FFFFFF" align="center">{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    zIndex: 9999,
    alignSelf: 'center',
  },
});
