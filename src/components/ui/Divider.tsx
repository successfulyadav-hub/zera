import { View, type ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export function Divider({ style, ...props }: ViewProps) {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.divider }, style]} {...props} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
