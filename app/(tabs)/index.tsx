import DropdownPicker from '@/components/ui/DropdownPicker';
import FormField from '@/components/ui/FormField';
import HabitCard from '@/components/habits/HabitCard';
import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { calcStreak } from '@/utils/dateHelpers';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background, padding: 16, paddingTop: 60 },
    centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
    errorText: { color: c.danger, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
    logo:      { width: 48, height: 48, alignSelf: 'center', marginBottom: 8 },
    brand:     { fontSize: 13, fontWeight: '700', color: c.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 },
    title:     { fontSize: 30, fontWeight: 'bold', color: c.text, marginBottom: 12 },

    // Quote card
    quoteCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 3,
      borderLeftColor: c.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    quoteText:    { fontSize: 14, fontStyle: 'italic', color: c.text, lineHeight: 20, marginBottom: 8 },
    quoteAuthor:  { fontSize: 12, fontWeight: '600', color: c.subtext, marginBottom: 12 },
    quoteError:   { fontSize: 14, color: c.subtext, marginBottom: 12 },
    quoteBtn:     { alignSelf: 'flex-start', backgroundColor: c.primaryLight, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
    quoteBtnText: { fontSize: 13, fontWeight: '600', color: c.primary },

    filterToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 12,
      gap: 8,
    },
    filterToggleText: { fontSize: 14, fontWeight: '600', color: c.text },
    badge: {
      backgroundColor: c.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 5,
    },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

    filterPanel: {
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    clearBtn: {
      backgroundColor: c.dangerLight,
      borderRadius: 8,
      paddingVertical: 9,
      alignItems: 'center',
    },
    clearBtnInline: {
      marginTop: 12,
      backgroundColor: c.dangerLight,
      borderRadius: 8,
      paddingVertical: 9,
      paddingHorizontal: 20,
    },
    clearBtnText: { color: c.danger, fontWeight: '600', fontSize: 14 },

    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyIcon:      { fontSize: 48, marginBottom: 12 },
    empty:          { fontSize: 15, color: c.subtext },
    fab: {
      position: 'absolute',
      bottom: 32,
      right: 24,
      backgroundColor: c.primary,
      width: 58,
      height: 58,
      borderRadius: 29,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    fabText: { color: '#fff', fontSize: 32, lineHeight: 36 },
  });
}

export default function HabitsScreen() {
  const { habits, deleteHabit, isLoading, error } = useHabits();
  const { categories }                            = useCategories();
  const { logs }                                  = useLogs();
  const { colours } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const [searchText, setSearchText]          = useState('');
  const [selectedCategoryId, setSelectedCat] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen]        = useState(false);

  const [quote, setQuote]               = useState<{ content: string; author: string } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError]     = useState(false);

  async function fetchQuote() {
    setQuoteLoading(true);
    setQuoteError(false);
    try {
      const res  = await fetch('https://zenquotes.io/api/random');
      const data = await res.json();
      setQuote({ content: data[0].q, author: data[0].a });
    } catch {
      setQuoteError(true);
    } finally {
      setQuoteLoading(false);
    }
  }

  useEffect(() => { fetchQuote(); }, []);

  function getCategoryColour(categoryId: number) {
    return categories.find(c => c.id === categoryId)?.color ?? '#ccc';
  }

  function getCategoryName(categoryId: number) {
    return categories.find(c => c.id === categoryId)?.name ?? '';
  }

  function confirmDelete(id: number) {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) },
    ]);
  }

  const search = searchText.trim().toLowerCase();
  const filteredHabits = habits.filter(h => {
    const matchesCat  = !selectedCategoryId || h.categoryId === parseInt(selectedCategoryId);
    const matchesText = !search || h.name.toLowerCase().includes(search);
    return matchesCat && matchesText;
  });

  const activeFilterCount = (search ? 1 : 0) + (selectedCategoryId ? 1 : 0);
  const filtersActive = activeFilterCount > 0;

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categories.map(c => ({ label: c.name, value: String(c.id), colour: c.color })),
  ];

  function clearFilters() {
    setSearchText('');
    setSelectedCat(null);
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colours.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
      <Text style={styles.brand}>HabitFlow</Text>
      <Text style={styles.title}>My Habits</Text>

      {/* Motivational quote card */}
      <View style={styles.quoteCard}>
        {quoteLoading ? (
          <ActivityIndicator size="small" color={colours.primary} />
        ) : quoteError ? (
          <Text style={styles.quoteError}>Could not load quote.</Text>
        ) : quote ? (
          <>
            <Text style={styles.quoteText}>"{quote.content}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </>
        ) : null}
        <TouchableOpacity
          style={styles.quoteBtn}
          onPress={fetchQuote}
          disabled={quoteLoading}
          accessibilityRole="button"
          accessibilityLabel="Get new quote"
        >
          <Text style={styles.quoteBtnText}>New Quote</Text>
        </TouchableOpacity>
      </View>

      {/* Filter toggle button */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setFiltersOpen(v => !v)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={filtersOpen ? 'Hide filters' : 'Show filters'}
      >
        <Text style={styles.filterToggleText}>
          {filtersOpen ? '▲ Filters' : '▼ Filters'}
        </Text>
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Collapsible filter panel */}
      {filtersOpen && (
        <View style={styles.filterPanel}>
          <FormField
            label="Search"
            placeholder="Search habits…"
            value={searchText}
            onChangeText={setSearchText}
          />
          <DropdownPicker
            label="Category"
            options={categoryOptions}
            selected={selectedCategoryId ?? ''}
            placeholder="All Categories"
            onSelect={v => setSelectedCat(v === '' ? null : v)}
          />
          {filtersActive && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={clearFilters}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
            >
              <Text style={styles.clearBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filteredHabits}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => {
          const streak = calcStreak(
            logs.filter(l => l.habitId === item.id && l.value > 0).map(l => l.date)
          );
          return (
            <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
              <HabitCard
                name={item.name}
                unit={item.unit}
                metricType={item.metricType}
                categoryColor={getCategoryColour(item.categoryId)}
                categoryName={getCategoryName(item.categoryId)}
                streak={streak}
                onPress={() => router.push(`/habit/${item.id}`)}
                onLongPress={() => confirmDelete(item.id)}
              />
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>
              {filtersActive ? 'No habits match your filters.' : 'No habits yet. Tap + to add one.'}
            </Text>
            {filtersActive && (
              <TouchableOpacity
                onPress={clearFilters}
                style={styles.clearBtnInline}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
              >
                <Text style={styles.clearBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/habit/new')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add new habit"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
