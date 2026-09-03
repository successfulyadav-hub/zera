import { useColorScheme } from 'react-native';
import { colors } from '@/theme';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const c = isDark ? colors.dark : colors.light;
  return { colors: c, isDark };
}
