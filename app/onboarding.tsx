import { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';
import { spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Calendar, CheckSquare, FileText, Bell, Sparkles } from 'lucide-react-native';
import { hapticLight } from '@/utils/haptics';

const { width } = Dimensions.get('window');

interface OnboardingPage {
  icon: React.ComponentType<{ color: string; size: number }>;
  title: string;
  subtitle: string;
  accent: string;
}

const PAGES: OnboardingPage[] = [
  {
    icon: Calendar,
    title: 'Your day, unified',
    subtitle: 'Calendar, tasks, notes, and reminders\nin one calm space.',
    accent: '#7B8F7A',
  },
  {
    icon: CheckSquare,
    title: 'Tasks that flow',
    subtitle: 'Prioritize, swipe to complete,\nand track your streak.',
    accent: '#8FA37B',
  },
  {
    icon: FileText,
    title: 'Notes that stick',
    subtitle: 'Quick capture with auto-save.\nPin what matters most.',
    accent: '#7B8FA3',
  },
  {
    icon: Bell,
    title: 'Never miss a beat',
    subtitle: 'Set reminders with smart\nnotifications and recurrence.',
    accent: '#A37B8F',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markOnboardingSeen = useAuthStore((s) => s.markOnboardingSeen);
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const dotScale = useSharedValue(1);

  const handleGetStarted = () => {
    hapticLight();
    markOnboardingSeen();
    router.replace('/(tabs)/today');
  };

  const handleSignIn = () => {
    hapticLight();
    markOnboardingSeen();
    router.push('/auth/login');
  };

  const handleNext = () => {
    hapticLight();
    if (currentPage < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1 });
      setCurrentPage(currentPage + 1);
      dotScale.value = withSpring(1.3, { damping: 10 }, () => {
        dotScale.value = withSpring(1);
      });
    } else {
      handleGetStarted();
    }
  };

  const isLastPage = currentPage === PAGES.length - 1;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} style={styles.logoContainer}>
        <Text variant="cursiveLg" color={colors.sage} align="center">
          zera
        </Text>
        <Animated.View entering={FadeIn.delay(600).duration(500)}>
          <Text variant="caption" color={colors.stone} align="center" style={styles.tagline}>
            beautifully minimal
          </Text>
        </Animated.View>
      </Animated.View>

      <FlatList
        ref={flatListRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentPage(page);
        }}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => {
          const Icon = item.icon;
          return (
            <View style={[styles.page, { width }]}>
              <Animated.View
                entering={FadeInDown.delay(300 + index * 100).duration(600)}
                style={[styles.iconCircle, { backgroundColor: colors.sageSoft }]}
              >
                <Icon color={colors.sage} size={32} />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(400 + index * 100).duration(600)}>
                <Text variant="display" align="center" style={styles.pageTitle}>
                  {item.title}
                </Text>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(500 + index * 100).duration(600)}>
                <Text variant="body" color={colors.stone} align="center" style={styles.pageSubtitle}>
                  {item.subtitle}
                </Text>
              </Animated.View>
            </View>
          );
        }}
      />

      <View style={styles.dots}>
        {PAGES.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === currentPage ? colors.sage : colors.divider,
                width: i === currentPage ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.actions}>
        <Button
          label={isLastPage ? 'Get Started' : 'Next'}
          onPress={handleNext}
        />
        {isLastPage && (
          <Button
            label="I have an account"
            variant="ghost"
            onPress={handleSignIn}
            style={styles.signInBtn}
          />
        )}
        {!isLastPage && (
          <Button
            label="Skip"
            variant="ghost"
            onPress={handleGetStarted}
            style={styles.signInBtn}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  logoContainer: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.sm,
  },
  tagline: {
    marginTop: spacing.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH * 2,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  pageTitle: {
    marginBottom: spacing.md,
  },
  pageSubtitle: {
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  signInBtn: { marginTop: spacing.xs },
});
