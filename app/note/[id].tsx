import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, Share, Platform, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Trash2, Pin, Share2, ChevronLeft, ChevronRight, FilePlus } from 'lucide-react-native';
import { Text, IconButton, ConfirmDialog } from '@/components/ui';
import { useNoteStore } from '@/stores/useNoteStore';
import { useToast } from '@/hooks/useToast';
import { useUndoToast } from '@/hooks/useUndoToast';
import { notesQuery, type Note } from '@/database/queries/notes';
import { useTheme } from '@/hooks/useTheme';
import { spacing, layout, typeScale } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticLight } from '@/utils/haptics';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { deleteNote, togglePin } = useNoteStore();
  const toast = useToast();
  const undoToast = useUndoToast();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pages, setPages] = useState<Note[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadPages = async (date: string) => {
    const p = await notesQuery.getPagesByDate(date);
    setPages(p);
    return p;
  };

  useEffect(() => {
    if (id) {
      notesQuery.getById(id).then(async (n) => {
        if (n) {
          setNote(n);
          setTitle(n.title || '');
          setContent(n.content || '');
          setIsPinned(n.is_pinned === 1);
          const p = await loadPages(n.date);
          const idx = p.findIndex(pg => pg.id === n.id);
          if (idx >= 0) setCurrentPageIndex(idx);
        }
      });
    }
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [id]);

  const saveCurrentNote = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    if (note) {
      notesQuery.update(note.id, { title: title || null, content });
    }
  };

  const switchToPage = (pageNote: Note) => {
    saveCurrentNote();
    setNote(pageNote);
    setTitle(pageNote.title || '');
    setContent(pageNote.content || '');
    setIsPinned(pageNote.is_pinned === 1);
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      hapticLight();
      const newIndex = currentPageIndex - 1;
      setCurrentPageIndex(newIndex);
      switchToPage(pages[newIndex]);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      hapticLight();
      const newIndex = currentPageIndex + 1;
      setCurrentPageIndex(newIndex);
      switchToPage(pages[newIndex]);
    }
  };

  const addNewPage = async () => {
    if (!note) return;
    hapticLight();
    saveCurrentNote();
    const maxPage = await notesQuery.getMaxPageNumber(note.date);
    const newId = await notesQuery.save(note.date, '', null, maxPage + 1);
    const newNote = await notesQuery.getById(newId);
    if (newNote) {
      const p = await loadPages(note.date);
      const idx = p.findIndex(pg => pg.id === newId);
      setCurrentPageIndex(idx >= 0 ? idx : p.length - 1);
      switchToPage(newNote);
      toast.show(`Page ${maxPage + 1} created`);
    }
  };

  const triggerAutoSave = (newContent: string, newTitle: string) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (note) {
        notesQuery.update(note.id, { title: newTitle || null, content: newContent });
      }
    }, 1500);
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    triggerAutoSave(text, title);
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    triggerAutoSave(content, text);
  };

  const handleClose = () => {
    saveCurrentNote();
    router.back();
  };

  const handleTogglePin = async () => {
    if (!note) return;
    hapticLight();
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    await togglePin(note.id, newPinned);
    toast.show(newPinned ? 'Note pinned' : 'Note unpinned');
  };

  const handleShare = async () => {
    if (!note) return;
    hapticLight();
    const shareTitle = title || 'Untitled Note';
    const shareContent = content || '';
    const text = shareTitle + (shareContent ? `\n\n${shareContent}` : '');
    await Share.share(Platform.OS === 'ios' ? { message: text } : { message: text, title: shareTitle });
  };

  const handleDelete = async () => {
    if (!note) return;
    setConfirmVisible(false);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    const deletedNote = { ...note, title, content };
    await deleteNote(note.id);
    router.back();
    undoToast.show('Note deleted', async () => {
      await notesQuery.save(deletedNote.date, deletedNote.content || '', deletedNote.title, deletedNote.page_number);
    });
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const hasMultiplePages = pages.length > 1;

  if (!note) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <IconButton icon={<X color={colors.ink} size={22} />} onPress={handleClose} />
        <Text variant="caption" color={colors.stone}>Auto-saved</Text>
        <View style={styles.headerRight}>
          <IconButton
            icon={<Share2 color={colors.stone} size={20} />}
            onPress={handleShare}
          />
          <IconButton
            icon={<Pin color={isPinned ? colors.sage : colors.stone} size={20} />}
            onPress={handleTogglePin}
          />
          <IconButton icon={<Trash2 color={colors.error} size={20} />} onPress={() => setConfirmVisible(true)} />
        </View>
      </View>
      <View style={styles.content}>
        <TextInput
          placeholder="Title"
          placeholderTextColor={colors.stone}
          value={title}
          onChangeText={handleTitleChange}
          style={[typeScale.screenTitle, { color: colors.ink, paddingHorizontal: layout.screenPaddingH }]}
        />
        <TextInput
          placeholder="Start writing..."
          placeholderTextColor={colors.stone}
          value={content}
          onChangeText={handleContentChange}
          multiline
          textAlignVertical="top"
          style={[typeScale.body, styles.editor, { color: colors.ink }]}
        />
      </View>

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Text variant="caption" color={colors.stone}>
          {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} {charCount === 1 ? 'char' : 'chars'}
        </Text>
        <View style={styles.pageNav}>
          {hasMultiplePages && (
            <>
              <TouchableOpacity
                onPress={goToPrevPage}
                disabled={currentPageIndex === 0}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronLeft color={currentPageIndex === 0 ? colors.divider : colors.stone} size={16} />
              </TouchableOpacity>
              <Text variant="caption" color={colors.stone}>
                {currentPageIndex + 1}/{pages.length}
              </Text>
              <TouchableOpacity
                onPress={goToNextPage}
                disabled={currentPageIndex === pages.length - 1}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronRight color={currentPageIndex === pages.length - 1 ? colors.divider : colors.stone} size={16} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={addNewPage} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <FilePlus color={colors.sage} size={16} />
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete Note"
        message="This note will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH, paddingVertical: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  content: { flex: 1, paddingTop: spacing.md },
  editor: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  pageNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
