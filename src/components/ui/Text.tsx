import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { typeScale } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export interface TextProps extends RNTextProps {
  variant?: keyof typeof typeScale;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Text({
  variant = 'body',
  color,
  align = 'left',
  style,
  ...props
}: TextProps) {
  const { colors } = useTheme();
  return (
    <RNText
      style={[typeScale[variant], { color: color ?? colors.ink, textAlign: align }, style]}
      {...props}
    />
  );
}
