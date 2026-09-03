import { useColorScheme } from 'react-native';
import { colors } from '@/theme';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { deriveThemeFromColors } from '@/utils/colorUtils';

export function useTheme() {
  const systemScheme = useColorScheme();
  const darkMode = useSettingsStore((s) => s.darkMode);
  const customBgColor = useSettingsStore((s) => s.customBgColor);
  const customAccentColor = useSettingsStore((s) => s.customAccentColor);
  const isDark =
    darkMode === 'dark' ? true :
    darkMode === 'light' ? false :
    systemScheme === 'dark';

  if (customBgColor || customAccentColor) {
    const baseBg = customBgColor || (isDark ? '#1C1B19' : '#F8F6F1');
    const baseAccent = customAccentColor || (isDark ? '#8FA88E' : '#7B8F7A');
    const c = deriveThemeFromColors(baseBg, baseAccent, isDark);
    return { colors: c, isDark };
  }

  const c = isDark ? colors.dark : colors.light;
  return { colors: c, isDark };
}
