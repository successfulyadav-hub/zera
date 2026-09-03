import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { spacing, radius, typeScale, layout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { hapticLight } from '@/utils/haptics';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search...', autoFocus }: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Search color={colors.stone} size={18} />
      <TextInput
        style={[styles.input, typeScale.body, { color: colors.ink }]}
        placeholder={placeholder}
        placeholderTextColor={colors.stone}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search"
        accessibilityHint="Type to search across all your items"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => { hapticLight(); onChangeText(''); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X color={colors.stone} size={18} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    height: 44,
    borderRadius: radius.md,
    marginHorizontal: layout.screenPaddingH,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
});
