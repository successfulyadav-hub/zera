import { StyleSheet } from 'react-native';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withDelay, withSequence } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { spacing, layout } from '@/theme';
import { CheckCircle, Sparkles } from 'lucide-react-native';
import { useEffect } from 'react';

interface CompletionBannerProps {
  visible: boolean;
}

export function CompletionBanner({ visible }: CompletionBannerProps) {
  const { colors } = useTheme();
  const iconScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      iconScale.value = withDelay(300, withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10 }),
      ));
    } else {
      iconScale.value = 0;
    }
  }, [visible]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(400).springify()}
      style={[styles.container, { backgroundColor: colors.sageSoft }]}
      accessibilityLabel="All tasks completed"
    >
      <Animated.View style={iconStyle}>
        <CheckCircle color={colors.sage} size={22} />
      </Animated.View>
      <Text variant="bodyMedium" color={colors.sage} style={styles.text}>
        All done for today!
      </Text>
      <Animated.View style={iconStyle}>
        <Sparkles color={colors.sage} size={16} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.screenPaddingH,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  text: {
    flex: 1,
  },
});
