import { TouchableOpacity, type TouchableOpacityProps, StyleSheet } from 'react-native';

export interface IconButtonProps extends TouchableOpacityProps {
  icon: React.ReactNode;
  size?: number;
}

export function IconButton({ icon, size = 44, style, ...props }: IconButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.button, { width: size, height: size, borderRadius: size / 2 }, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      {...props}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
