import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { layout, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const content = (
    <View style={[styles.inner, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.row}>
        <View style={styles.titleWrap}>
          <Text variant="screenTitle">{title}</Text>
          {subtitle && <Text variant="caption" color={colors.stone}>{subtitle}</Text>}
        </View>
        {right && <View>{right}</View>}
      </View>
    </View>
  );

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <BlurView
          intensity={isDark ? 50 : 70}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        >
          <View style={[StyleSheet.absoluteFill, {
            backgroundColor: isDark ? 'rgba(28,27,25,0.5)' : 'rgba(248,246,241,0.3)',
          }]} />
        </BlurView>
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.container, {
      backgroundColor: isDark ? 'rgba(28,27,25,0.85)' : 'rgba(248,246,241,0.75)',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  inner: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.md,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
  },
});
