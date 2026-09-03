import { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/useAuthStore';
import { spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Calendar, CheckSquare, FileText, Bell } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface OnboardingPage {
  icon: React.ComponentType<{ color: string; size: number }>;
  title: string;
  subtitle: string;
}

const PAGES: OnboardingPage[] = [
  {
    icon: Calendar,
    title: 'Your day, unified',
    subtitle: 'Calendar, tasks, notes, and reminders in one calm space.',
  },
  {
    icon: CheckSquare,
    title: 'Tasks that flow',
    subtitle: 'Prioritize, swipe to complete, and track your streak.',
  },
  {
    icon: FileText,
    title: 'Notes that stick',
    subtitle: 'Quick capture with auto-save. Pin what matters most.',
  },
  {
    icon: Bell,
    title: 'Never miss a beat',
    subtitle: 'Set reminders with smart notifications and recurrence.',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markOnboardingSeen = useAuthStore((s) => s.markOnboardingSeen);
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleGetStarted = () => {
    markOnboardingSeen();
    router.replace('/(tabs)/today');
  };

  const handleSignIn = () => {
    markOnboardingSeen();
    router.push('/auth/login');
  };

  const handleNext = () => {
    if (currentPage < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1 });
      setCurrentPage(currentPage + 1);
    } else {
      handleGetStarted();
    }
  };

  const isLastPage = currentPage === PAGES.length - 1;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.logoContainer}>
        <Text variant="cursiveLg" color={colors.sage} align="center">
          zera
        </Text>
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
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={[styles.page, { width }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors.sageSoft }]}>
                <Icon color={colors.sage} size={32} />
              </View>
              <Text variant="display" align="center" style={styles.pageTitle}>
                {item.title}
              </Text>
              <Text variant="body" color={colors.stone} align="center" style={styles.pageSubtitle}>
                {item.subtitle}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.dots}>
        {PAGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === currentPage ? colors.sage : colors.divider },
            ]}
          />
        ))}
      </View>

      <View style={styles.actions}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  logoContainer: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH * 2,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  pageTitle: {
    marginBottom: spacing.md,
  },
  pageSubtitle: {
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  dot: {
    width: 8,
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
