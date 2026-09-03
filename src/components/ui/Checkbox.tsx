import { TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { hapticLight } from '@/utils/haptics';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: number;
}

export function Checkbox({ checked, onCheckedChange, size = 22 }: CheckboxProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    hapticLight();
    onCheckedChange(!checked);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(checked ? colors.sage : 'transparent', { duration: 200 }),
    borderColor: withTiming(checked ? colors.sage : colors.stone, { duration: 200 }),
    transform: [{ scale: withSpring(checked ? 1.05 : 1, { damping: 15, stiffness: 200 }) }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <Animated.View style={[styles.box, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]}>
        {checked && <Check color="#FFFFFF" size={size * 0.7} strokeWidth={3} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
