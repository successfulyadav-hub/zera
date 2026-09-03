import { TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { shadows } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { hapticMedium } from '@/utils/haptics';

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    hapticMedium();
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[styles.fab, shadows.deep, { backgroundColor: colors.sage }]}
      accessibilityRole="button"
      accessibilityLabel="Create new"
    >
      <Plus color="#FFFFFF" size={24} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
