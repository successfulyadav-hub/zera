import { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

function SkeletonBlock({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, backgroundColor: colors.surface },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function TaskSkeleton() {
  return (
    <View style={skeletonStyles.taskRow}>
      <SkeletonBlock width={20} height={20} borderRadius={4} />
      <SkeletonBlock width="70%" height={16} style={{ marginLeft: spacing.md }} />
    </View>
  );
}

export function EventSkeleton() {
  return (
    <View style={skeletonStyles.eventRow}>
      <SkeletonBlock width={50} height={14} />
      <SkeletonBlock width={3} height={36} borderRadius={2} style={{ marginHorizontal: spacing.md }} />
      <View style={{ flex: 1 }}>
        <SkeletonBlock width="60%" height={16} />
        <SkeletonBlock width="40%" height={12} style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  );
}

export function CardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <SkeletonBlock width={80} height={12} />
      <SkeletonBlock width="50%" height={18} style={{ marginTop: spacing.sm }} />
      <SkeletonBlock width="80%" height={14} style={{ marginTop: spacing.xs }} />
    </View>
  );
}

export function ListSkeleton({ count = 3, type = 'task' }: { count?: number; type?: 'task' | 'event' | 'card' }) {
  const Component = type === 'event' ? EventSkeleton : type === 'card' ? CardSkeleton : TaskSkeleton;
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 24,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: spacing.sm,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
});
