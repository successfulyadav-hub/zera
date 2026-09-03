import { TouchableOpacity, type TouchableOpacityProps, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary' ? colors.sage :
    variant === 'secondary' ? colors.sageSoft :
    'transparent';

  const textColor =
    variant === 'primary' ? '#FFFFFF' :
    isDisabled ? colors.stone :
    colors.ink;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[styles.base, { backgroundColor: bg }, isDisabled && styles.disabled, style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text variant="bodyMedium" color={textColor}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.6,
  },
});
