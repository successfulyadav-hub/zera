import { TextInput, type TextInputProps, StyleSheet } from 'react-native';
import { radius, spacing, typeScale } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export interface InputProps extends TextInputProps {}

export function Input({ style, ...props }: InputProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.stone}
      style={[styles.input, typeScale.body, { backgroundColor: colors.surface, color: colors.ink }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
});
