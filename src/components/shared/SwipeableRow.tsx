import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { hapticMedium } from '@/utils/haptics';

const DELETE_THRESHOLD = -80;

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeableRow({ children, onDelete }: SwipeableRowProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);

  const handleDelete = () => {
    hapticMedium();
    onDelete();
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
        <Trash2 color="#FFFFFF" size={20} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ backgroundColor: colors.bg }, rowStyle]}>
          {children}
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
});
