import { View, StyleSheet } from 'react-native';
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
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md, backgroundColor: colors.bg }]}>
      <View style={styles.row}>
        <View style={styles.titleWrap}>
          <Text variant="screenTitle">{title}</Text>
          {subtitle && <Text variant="caption" color={colors.stone}>{subtitle}</Text>}
        </View>
        {right && <View>{right}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.md,
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
