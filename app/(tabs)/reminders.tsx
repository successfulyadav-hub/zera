import { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, RefreshControl, SectionList } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SwipeableRow } from '@/components/shared/SwipeableRow';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { FAB } from '@/components/shared/FAB';
import { ReminderItem } from '@/components/reminders/ReminderItem';
import { Text } from '@/components/ui';
import { useReminderStore } from '@/stores/useReminderStore';
import { useTheme } from '@/hooks/useTheme';
import { useSync } from '@/hooks/useSync';
import { useToast } from '@/hooks/useToast';
import { useUndoToast } from '@/hooks/useUndoToast';
import { remindersQuery } from '@/database/queries/reminders';
import { formatDateKey, friendlyDate, parseDate } from '@/utils/dates';
import { cancelNotification } from '@/utils/notifications';
import { layout, spacing } from '@/theme';
import { type Reminder } from '@/database/queries/reminders';

interface Section {
  title: string;
  data: Reminder[];
}

export default function RemindersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const undoToast = useUndoToast();
  const { upcoming, loadUpcoming, deleteReminder } = useReminderStore();
  const { triggerSync } = useSync();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  useFocusEffect(
    useCallback(() => {
      loadUpcoming(formatDateKey(new Date())).then(() => {
        if (!hasLoaded.current) {
          hasLoaded.current = true;
          setLoading(false);
        }
      });
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await triggerSync();
    loadUpcoming(formatDateKey(new Date()));
    setRefreshing(false);
  }, [triggerSync]);

  const handleDelete = async (id: string, date: string) => {
    const reminder = upcoming.find((r) => r.id === id);
    await deleteReminder(id, date);
    await cancelNotification(id);
    loadUpcoming(formatDateKey(new Date()));
    if (reminder) {
      undoToast.show('Reminder deleted', async () => {
        const { id: _id, ...rest } = reminder;
        await remindersQuery.create(rest);
        loadUpcoming(formatDateKey(new Date()));
      });
    }
  };

  const sections: Section[] = useMemo(() => {
    const grouped: Record<string, Reminder[]> = {};
    for (const r of upcoming) {
      if (!grouped[r.date]) grouped[r.date] = [];
      grouped[r.date].push(r);
    }
    return Object.entries(grouped).map(([date, data]) => ({
      title: friendlyDate(parseDate(date)),
      data,
    }));
  }, [upcoming]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenHeader title="Reminders" />
      {loading ? (
        <View style={{ paddingHorizontal: layout.screenPaddingH, paddingTop: spacing.lg }}>
          <ListSkeleton count={4} type="task" />
        </View>
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={<Bell color={colors.stone} size={32} />}
          title="No reminders"
          subtitle="Tap + to set one"
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SwipeableRow onDelete={() => handleDelete(item.id, item.date)}>
              <ReminderItem reminder={item} index={index} />
            </SwipeableRow>
          )}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.bg }]}>
              <Text variant="caption" color={colors.stone} style={styles.sectionTitle}>
                {section.title}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.sage}
              colors={[colors.sage]}
            />
          }
        />
      )}
      <FAB onPress={() => router.push('/reminder/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingBottom: 100 },
  sectionHeader: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
