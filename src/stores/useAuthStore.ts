import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

const ONBOARDING_KEY = 'zera_onboarding_seen';

interface AuthStore {
  session: Session | null;
  user: User | null;
  loading: boolean;
  hasSeenOnboarding: boolean;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  markOnboardingSeen: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  hasSeenOnboarding: false,

  initialize: async () => {
    try {
      const onboardingRaw = await AsyncStorage.getItem(ONBOARDING_KEY);
      let session: Session | null = null;

      if (supabase) {
        const { data } = await supabase.auth.getSession();
        session = data.session;

        supabase.auth.onAuthStateChange((_event, s) => {
          set({ session: s, user: s?.user ?? null });
        });
      }

      set({
        session,
        user: session?.user ?? null,
        hasSeenOnboarding: onboardingRaw === 'true',
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  signUp: async (email, password) => {
    if (!supabase) return { error: 'Cloud sync not configured' };
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signIn: async (email, password) => {
    if (!supabase) return { error: 'Cloud sync not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  markOnboardingSeen: () => {
    set({ hasSeenOnboarding: true });
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  },
}));
