import DropdownPicker from '@/components/ui/DropdownPicker';
import FormField from '@/components/ui/FormField';
import { AppColours } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type DateRange = 'all' | 'today' | 'week' | 'month';

function getDateBounds(range: DateRange): { from: string | null; to: string | null } {
  if (range === 'all') return { from: null, to: null };
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const toDate = fmt(today);
  if (range === 'today') return { from: toDate, to: toDate };
  const from = new Date(today);
  if (range === 'week')  from.setDate(today.getDate() - 6);
  if (range === 'month') from.setDate(today.getDate() - 29);
  return { from: fmt(from), to: toDate };
}

const DATE_CHIPS: { label: string; value: DateRange }[] = [
  { label: 'All',   value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Week',  value: 'week' },
  { label: 'Month', value: 'month' },
];

export default function LogsScreen() {
  const router = useRouter();
  const { logs, deleteLog }  = useLogs();
  const { habits }           = useHabits();
  const { categories }       = useCategories();

  const [searchText, setSearchText]          = useState('');
  const [selectedCategoryId, setSelectedCat] = useState<string | null>(null);
  const [dateRange, setDateRange]            = useState<DateRange>('all');
  const [filtersOpen, setFiltersOpen]        = useState(false);

  function getHabit(habitId: number) {
    return habits.find(h => h.id === habitId);
  }

  function getCategoryColour(habitId: number) {
    const habit = getHabit(habitId);
    return categories.find(c => c.id === habit?.categoryId)?.colour ?? '#ccc';
  }

  function formatMinutes(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  function formatValue(habitId: number, value: number) {
    const habit = getHabit(habitId);
    if (!habit) return `${value}`;
    if (habit.metricType === 'boolean') return value === 1 ? 'Done' : 'Not Done';
    if (habit.unit === 'hrs/mins') return formatMinutes(value);
    return `${value} ${habit.unit}`;
  }

  function confirmDelete(id: number) {
    Alert.alert('Delete Log', 'Are you sure you want to delete this log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLog(id) },
    ]);
  }

  // Sort and group all logs by date
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const grouped: { date: string; data: typeof logs }[] = [];
  sorted.forEach(log => {
    const existing = grouped.find(g => g.date === log.date);
    if (existing) existing.data.push(log);
    else grouped.push({ date: log.date, data: [log] });
  });

  // Apply filters in-memory
  const { from, to } = getDateBounds(dateRange);
  const search = searchText.trim().toLowerCase();

  const displayedGrouped = grouped
    .map(group => ({
      ...group,
      data: group.data.filter(log => {
        const habit = getHabit(log.habitId);
        if (from && log.date < from) return false;
        if (to   && log.date > to)   return false;
        if (selectedCategoryId && habit?.categoryId !== parseInt(selectedCategoryId)) return false;
        if (search) {
          const matchesName  = habit?.name.toLowerCase().includes(search) ?? false;
          const matchesNotes = log.notes?.toLowerCase().includes(search) ?? false;
          if (!matchesName && !matchesNotes) return false;
        }
        return true;
      }),
    }))
    .filter(g => g.data.length > 0);

  const activeFilterCount =
    (search ? 1 : 0) +
    (selectedCategoryId ? 1 : 0) +
    (dateRange !== 'all' ? 1 : 0);
  const filtersActive = activeFilterCount > 0;

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categories.map(c => ({ label: c.name, value: String(c.id), colour: c.colour })),
  ];

  function clearFilters() {
    setSearchText('');
    setSelectedCat(null);
    setDateRange('all');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Logs</Text>

      {/* Filter toggle button */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setFiltersOpen(v => !v)}
        activeOpacity={0.7}
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
            placeholder="Search habits or notes…"
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
          <Text style={styles.chipLabel}>Date Range</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          >
            {DATE_CHIPS.map(chip => (
              <TouchableOpacity
                key={chip.value}
                style={[styles.chip, dateRange === chip.value && styles.chipActive]}
                onPress={() => setDateRange(chip.value)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, dateRange === chip.value && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {filtersActive && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters} activeOpacity={0.75}>
              <Text style={styles.clearBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={displayedGrouped}
        keyExtractor={item => item.date}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{filtersActive ? '🔍' : '📋'}</Text>
            <Text style={styles.empty}>
              {filtersActive ? 'No logs match your filters.' : 'No logs yet. Tap + to add one.'}
            </Text>
            {filtersActive && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearBtnInline}>
                <Text style={styles.clearBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item: group, index: groupIndex }) => (
          <Animated.View entering={FadeInDown.delay(groupIndex * 60).springify()}>
            <Text style={styles.dateHeader}>{group.date}</Text>
            {group.data.map(log => (
              <View key={log.id} style={styles.logCard}>
                <View style={[styles.categoryBar, { backgroundColor: getCategoryColour(log.habitId) }]} />
                <View style={styles.logBody}>
                  <Text style={styles.habitName}>{getHabit(log.habitId)?.name ?? 'Unknown'}</Text>
                  <Text style={styles.logValue}>{formatValue(log.habitId, log.value)}</Text>
                  {log.notes ? <Text style={styles.logNotes}>{log.notes}</Text> : null}
                </View>
                <View style={styles.logActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push(`/log/edit/${log.id}`)}
                  >
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDelete(log.id)}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/log/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColours.background, padding: 16, paddingTop: 60 },
  title:     { fontSize: 30, fontWeight: 'bold', color: AppColours.text, marginBottom: 12 },

  // Filter toggle
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: AppColours.card,
    borderWidth: 1,
    borderColor: AppColours.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 12,
    gap: 8,
  },
  filterToggleText: { fontSize: 14, fontWeight: '600', color: AppColours.text },
  badge: {
    backgroundColor: AppColours.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Filter panel
  filterPanel: {
    backgroundColor: AppColours.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  chipLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  chipRow:   { marginBottom: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColours.border,
    backgroundColor: AppColours.card,
  },
  chipActive:     { backgroundColor: AppColours.primary, borderColor: AppColours.primary },
  chipText:       { fontSize: 13, fontWeight: '600', color: AppColours.text },
  chipTextActive: { color: '#fff' },
  clearBtn: {
    backgroundColor: AppColours.dangerLight,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  clearBtnInline: {
    marginTop: 12,
    backgroundColor: AppColours.dangerLight,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 20,
  },
  clearBtnText: { color: AppColours.danger, fontWeight: '600', fontSize: 14 },

  // Log list (unchanged)
  dateHeader: {
    fontSize: 13, fontWeight: '700', color: AppColours.subtext,
    marginBottom: 8, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  logCard: {
    backgroundColor: AppColours.card,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryBar:   { width: 5, alignSelf: 'stretch' },
  logBody:       { flex: 1, padding: 14 },
  habitName:     { fontSize: 14, fontWeight: '700', color: AppColours.text },
  logValue:      { fontSize: 16, fontWeight: '600', color: AppColours.primary, marginTop: 2 },
  logNotes:      { fontSize: 12, color: AppColours.subtext, marginTop: 4 },
  logActions:    { flexDirection: 'row', gap: 6, paddingRight: 12 },
  editBtn:       { backgroundColor: AppColours.editLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  editBtnText:   { color: AppColours.edit, fontWeight: '600', fontSize: 12 },
  deleteBtn:     { backgroundColor: AppColours.dangerLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  deleteBtnText: { color: AppColours.danger, fontWeight: '600', fontSize: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon:      { fontSize: 48, marginBottom: 12 },
  empty:          { fontSize: 15, color: AppColours.subtext },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: AppColours.primary,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AppColours.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 36 },
});
