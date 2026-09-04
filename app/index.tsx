import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Index() {
  const loading = useAuthStore((s) => s.loading);
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);

  if (loading) return null;
  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/today" />;
}
