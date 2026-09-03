import { TextInput, type TextInputProps, StyleSheet } from 'react-native';
import { radius, spacing, typeScale } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export function TextArea({ style, ...props }: TextInputProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      multiline
      placeholderTextColor={colors.stone}
      style={[styles.textarea, typeScale.body, { backgroundColor: colors.surface, color: colors.ink }, style]}
      textAlignVertical="top"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    minHeight: 120,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
});
