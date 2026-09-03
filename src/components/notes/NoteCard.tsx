import { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text, Card } from '@/components/ui';
import { type Note } from '@/database/queries/notes';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { friendlyDateShort, parseDate } from '@/utils/dates';
import { Pin } from 'lucide-react-native';

interface NoteCardProps {
  note: Note;
  index?: number;
}

export const NoteCard = memo(function NoteCard({ note, index = 0 }: NoteCardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const isPinned = note.is_pinned === 1;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/note/${note.id}`)}>
        <Card style={styles.card}>
          <View style={styles.topRow}>
            <Text variant="caption" color={colors.stone}>
              {friendlyDateShort(parseDate(note.date))}{note.page_number > 1 ? ` · p${note.page_number}` : ''}
            </Text>
            {isPinned && <Pin color={colors.sage} size={14} />}
          </View>
          <Text variant="bodyMedium" numberOfLines={1} style={styles.title}>
            {note.title || 'Untitled Note'}
          </Text>
          {note.content ? (
            <Text variant="bodySmall" color={colors.stone} numberOfLines={2}>
              {note.content}
            </Text>
          ) : null}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { marginVertical: spacing.xs },
});
