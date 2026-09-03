import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Card } from '@/components/ui';
import { type Note } from '@/database/queries/notes';
import { spacing, layout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';

interface NotePreviewProps {
  note?: Note;
  date: string;
}

export function NotePreview({ note, date }: NotePreviewProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    if (note) {
      router.push(`/note/${note.id}`);
    } else {
      router.push(`/note/new?date=${date}`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <Card style={styles.card}>
          {!note || !note.content ? (
            <Text variant="cursive" color={colors.stone}>what's on your mind?</Text>
          ) : (
            <View>
              <Text variant="sectionLabel" color={colors.stone} style={styles.label}>
                TODAY'S NOTE
              </Text>
              <Text variant="body" color={colors.ink} numberOfLines={2}>
                {note.content}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.xxl,
  },
  card: { minHeight: 72, justifyContent: 'center' },
  label: { marginBottom: spacing.xs },
});
