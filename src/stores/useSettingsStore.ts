import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  darkMode: 'system' | 'light' | 'dark';
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  customBgColor: string | null;
  customAccentColor: string | null;
  loaded: boolean;
  load: () => Promise<void>;
  setDarkMode: (mode: 'system' | 'light' | 'dark') => Promise<void>;
  setHaptics: (enabled: boolean) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  setCustomBgColor: (color: string | null) => Promise<void>;
  setCustomAccentColor: (color: string | null) => Promise<void>;
}

const SETTINGS_KEY = 'zera_settings';

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  darkMode: 'system',
  hapticsEnabled: true,
  notificationsEnabled: true,
  customBgColor: null,
  customAccentColor: null,
  loaded: false,
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({ ...data, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
  setDarkMode: async (mode) => {
    set({ darkMode: mode });
    await persist(get());
  },
  setHaptics: async (enabled) => {
    set({ hapticsEnabled: enabled });
    await persist(get());
  },
  setNotifications: async (enabled) => {
    set({ notificationsEnabled: enabled });
    await persist(get());
  },
  setCustomBgColor: async (color) => {
    set({ customBgColor: color });
    await persist(get());
  },
  setCustomAccentColor: async (color) => {
    set({ customAccentColor: color });
    await persist(get());
  },
}));

async function persist(state: SettingsStore) {
  const { darkMode, hapticsEnabled, notificationsEnabled, customBgColor, customAccentColor } = state;
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ darkMode, hapticsEnabled, notificationsEnabled, customBgColor, customAccentColor }));
}
