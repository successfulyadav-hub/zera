import { StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { spacing, layout } from '@/theme';
import { CheckCircle } from 'lucide-react-native';

interface CompletionBannerProps {
  visible: boolean;
}

export function CompletionBanner({ visible }: CompletionBannerProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(400).springify()}
      style={[styles.container, { backgroundColor: colors.sageSoft }]}
      accessibilityLabel="All tasks completed"
    >
      <CheckCircle color={colors.sage} size={20} />
      <Text variant="bodyMedium" color={colors.sage} style={styles.text}>
        All done for today!
      </Text>
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
