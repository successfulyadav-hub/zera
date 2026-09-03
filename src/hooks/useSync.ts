import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { useAuthStore } from '@/stores/useAuthStore';
import { syncAll } from '@/lib/sync';

export function useSync() {
  const user = useAuthStore((s) => s.user);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const doSync = useCallback(async () => {
    if (!user || syncing) return;
    setSyncing(true);
    try {
      await syncAll(user.id);
      setLastSync(new Date());
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setSyncing(false);
    }
  }, [user, syncing]);

  useEffect(() => {
    if (!user) return;

    doSync();

    intervalRef.current = setInterval(doSync, 5 * 60 * 1000);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') doSync();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [user]);

  return { syncing, lastSync, triggerSync: doSync };
}
