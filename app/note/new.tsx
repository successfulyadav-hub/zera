import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { Text, IconButton } from '@/components/ui';
import { useNoteStore } from '@/stores/useNoteStore';
import { useTheme } from '@/hooks/useTheme';
import { formatDateKey } from '@/utils/dates';
import { spacing, layout, typeScale } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewNoteScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const saveNote = useNoteStore((s) => s.saveNote);

  const date = dateParam || formatDateKey(new Date());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const triggerAutoSave = (newContent: string, newTitle: string) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (newContent.trim() || newTitle.trim()) {
        saveNote(date, newContent, newTitle || null);
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
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    if (content.trim() || title.trim()) {
      saveNote(date, content, title || null);
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <IconButton icon={<X color={colors.ink} size={22} />} onPress={handleClose} />
        <Text variant="caption" color={colors.stone}>Auto-saved</Text>
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
          autoFocus
        />
      </View>

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Text variant="caption" color={colors.stone}>
          {content.trim() ? content.trim().split(/\s+/).length : 0} words · {content.length} chars
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH, paddingVertical: spacing.sm,
  },
  content: { flex: 1, paddingTop: spacing.md },
  editor: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
  },
  footer: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
});
