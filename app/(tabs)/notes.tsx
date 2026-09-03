import { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, RefreshControl, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { FileText, Search } from 'lucide-react-native';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SwipeableRow } from '@/components/shared/SwipeableRow';
import { ListSkeleton } from '@/components/shared/Skeleton';
import { FAB } from '@/components/shared/FAB';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNoteStore } from '@/stores/useNoteStore';
import { useTheme } from '@/hooks/useTheme';
import { useSync } from '@/hooks/useSync';
import { useToast } from '@/hooks/useToast';
import { useUndoToast } from '@/hooks/useUndoToast';
import { notesQuery } from '@/database/queries/notes';
import { formatDateKey } from '@/utils/dates';
import { layout, spacing, typeScale } from '@/theme';

export default function NotesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const undoToast = useUndoToast();
  const { allNotes, loadAllNotes, deleteNote } = useNoteStore();
  const { triggerSync } = useSync();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  useFocusEffect(
    useCallback(() => {
      loadAllNotes().then(() => {
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
    loadAllNotes();
    setRefreshing(false);
  }, [triggerSync]);

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return allNotes;
    const q = search.toLowerCase();
    return allNotes.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q))
    );
  }, [allNotes, search]);

  const handleDelete = async (id: string) => {
    const note = allNotes.find((n) => n.id === id);
    await deleteNote(id);
    if (note) {
      undoToast.show('Note deleted', async () => {
        await notesQuery.save(note.date, note.content || '', note.title, note.page_number);
        loadAllNotes();
      });
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenHeader title="Notes" />

      <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
        <Search color={colors.stone} size={18} />
        <TextInput
          style={[typeScale.body, styles.searchInput, { color: colors.ink }]}
          placeholder="Search notes..."
          placeholderTextColor={colors.stone}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: layout.screenPaddingH }}>
          <ListSkeleton count={4} type="card" />
        </View>
      ) : (
        <FlashList
          data={filteredNotes}
          renderItem={({ item, index }) => (
            <SwipeableRow onDelete={() => handleDelete(item.id)}>
              <NoteCard note={item} index={index} />
            </SwipeableRow>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.sage}
              colors={[colors.sage]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<FileText color={colors.stone} size={32} />}
              title={search ? 'No matching notes' : 'No notes yet'}
              subtitle={search ? 'Try a different search' : 'Tap + to start writing'}
            />
          }
        />
      )}
      <FAB onPress={() => router.push(`/note/new?date=${formatDateKey(new Date())}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.screenPaddingH,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  list: { paddingHorizontal: layout.screenPaddingH, paddingBottom: 100 },
});
