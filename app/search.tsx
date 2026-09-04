import { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Calendar, CheckSquare, FileText, Bell, X } from 'lucide-react-native';
import { SearchBar } from '@/components/search/SearchBar';
import { Text, IconButton } from '@/components/ui';
import { searchQuery, type SearchResult } from '@/database/queries/search';
import { useTheme } from '@/hooks/useTheme';
import { friendlyDateShort, parseDate } from '@/utils/dates';
import { spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const typeIcons = {
  event: Calendar,
  task: CheckSquare,
  note: FileText,
  reminder: Bell,
};

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length >= 2) {
      setSearching(true);
      debounceRef.current = setTimeout(() => {
        searchQuery.search(text.trim()).then((r) => {
          setResults(r);
          setSearching(false);
        }).catch(() => setSearching(false));
      }, 200);
    } else {
      setResults([]);
      setSearching(false);
    }
  }, []);

  const handleTap = (item: SearchResult) => {
    switch (item.type) {
      case 'event': router.push(`/event/${item.id}`); break;
      case 'note': router.push(`/note/${item.id}`); break;
      case 'reminder': router.push(`/reminder/${item.id}`); break;
      case 'task': router.back(); break;
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => {
    const Icon = typeIcons[item.type];
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => handleTap(item)} style={styles.resultItem}>
        <View style={[styles.iconWrap, { backgroundColor: colors.sageSoft }]}>
          <Icon color={colors.sage} size={16} />
        </View>
        <View style={styles.resultContent}>
          <Text variant="bodyMedium" numberOfLines={1}>{item.title}</Text>
          <View style={styles.resultMeta}>
            <Text variant="caption" color={colors.stone}>{item.type}</Text>
            <Text variant="caption" color={colors.stone}> · {friendlyDateShort(parseDate(item.date))}</Text>
          </View>
          {item.preview && <Text variant="bodySmall" color={colors.stone} numberOfLines={1}>{item.preview}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={handleSearch} placeholder="Search everything..." autoFocus />
        </View>
        <IconButton icon={<X color={colors.ink} size={22} />} onPress={() => router.back()} />
      </View>
      <FlashList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          searching ? (
            <ActivityIndicator size="small" color={colors.sage} style={styles.empty} />
          ) : query.length >= 2 ? (
            <Text variant="body" color={colors.stone} align="center" style={styles.empty}>
              No results found
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
  },
  searchWrap: { flex: 1 },
  list: { paddingBottom: 50 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: layout.screenPaddingH,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  resultContent: { flex: 1 },
  resultMeta: { flexDirection: 'row' },
  empty: { paddingTop: spacing.xxxl },
});
