import { useColorScheme } from 'react-native';
import { colors } from '@/theme';
import { useSettingsStore } from '@/stores/useSettingsStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const darkMode = useSettingsStore((s) => s.darkMode);
  const isDark =
    darkMode === 'dark' ? true :
    darkMode === 'light' ? false :
    systemScheme === 'dark';
  const c = isDark ? colors.dark : colors.light;
  return { colors: c, isDark };
}
