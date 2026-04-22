//This imports all the components and contexts needed for the habits screen
import HabitCard from '@/components/habits/HabitCard';
import DropdownPicker from '@/components/ui/DropdownPicker';
import FormField from '@/components/ui/FormField';
import { AppColours } from '@/constants/theme';
import { useHabitsContext } from '@/context/HabitsContext';
import { useTheme } from '@/context/ThemeContext';
import type { habitLogs, habits } from '@/db/schema';
import { useCategories } from '@/hooks/useCategories';
import { useLogs } from '@/hooks/useLogs';
import { useTargets } from '@/hooks/useTargets';
import { calcStreak } from '@/utils/dateHelpers';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList,
  Keyboard,
  KeyboardAvoidingView, Modal, Platform,
  StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Log   = typeof habitLogs.$inferSelect;
type Habit = typeof habits.$inferSelect;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//This returns today's date as a YYYY-MM-DD string
function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

//This builds an array of the last 7 days for the date strip at the top of the screen
function buildDayStrip(): { date: string; dayName: string; dayNum: string }[] {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      date:    d.toISOString().split('T')[0],
      dayName: DAY_NAMES[d.getDay()],
      dayNum:  String(d.getDate()),
    });
  }
  return result;
}

//This generates a stylesheet from the current theme colours
function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background, padding: 16, paddingTop: 20 },
    centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
    errorText: { color: c.danger, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
    title:     { fontSize: 30, fontWeight: 'bold', fontFamily: 'Sora_700Bold', color: c.text, marginBottom: 20 },

    strip:        { flexDirection: 'row', marginBottom: 16, justifyContent: 'space-between' },
    dayBtn:       { flex: 1, marginHorizontal: 2, minWidth: 40, alignItems: 'center', paddingVertical: 8, borderRadius: 24, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
    dayBtnActive: { backgroundColor: c.primary, borderColor: c.primary, shadowColor: c.primary, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
    dayName:      { fontSize: 10, fontWeight: '600', color: c.subtext, textTransform: 'uppercase' },
    dayNum:       { fontSize: 16, fontWeight: '700', color: c.text, marginTop: 2 },
    dayTextActive:{ color: '#fff' },

    filterToggle: {
      flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
      backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
      borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, gap: 8,
    },
    filterToggleText: { fontSize: 14, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.text },
    badge:     { backgroundColor: c.primary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    filterPanel: {
      backgroundColor: c.card, borderRadius: 16, padding: 20, marginBottom: 16,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },
    clearBtn:       { backgroundColor: c.dangerLight, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    clearBtnInline: { marginTop: 12, backgroundColor: c.dangerLight, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
    clearBtnText:   { color: c.danger, fontWeight: '600', fontSize: 14, fontFamily: 'Sora_600SemiBold' },

    emptyContainer: { alignItems: 'center', marginTop: 80 },
    empty:          { fontSize: 16, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.text },
    emptyHint:      { fontSize: 13, color: c.subtext, marginTop: 8, textAlign: 'center', fontFamily: 'Sora_400Regular' },

    fab: {
      position: 'absolute', bottom: 32, right: 24,
      backgroundColor: c.primary, width: 58, height: 58, borderRadius: 29,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
    },
    fabText: { color: '#fff', fontSize: 32, lineHeight: 36 },

    overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet:           { backgroundColor: c.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
    sheetTitle:      { fontSize: 20, fontWeight: '700', fontFamily: 'Sora_700Bold', color: c.text, marginBottom: 20 },
    sheetRow:        { flexDirection: 'row', gap: 12 },
    sheetField:      { flex: 1 },
    modalSave:       { backgroundColor: c.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
    modalSaveText:   { color: '#fff', fontWeight: '600', fontFamily: 'Sora_600SemiBold', fontSize: 15 },
    modalCancel:     { padding: 14, alignItems: 'center' },
    modalCancelText: { color: c.subtext, fontSize: 15, fontFamily: 'Sora_400Regular' },
  });
}

export default function HabitsScreen() {
  const { habits, deleteHabit, isLoading, error } = useHabitsContext();
  const { categories }                            = useCategories();
  const { logs, addLog, updateLog, deleteLog }    = useLogs();
  const { targets }                               = useTargets();
  const { colours } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  //This defaults the selected date to today and holds filter and modal state
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr);
  const [searchText, setSearchText]     = useState('');
  const [selectedCategoryId, setSelectedCat] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen]   = useState(false);

  const [modalHabit, setModalHabit]   = useState<Habit | null>(null);
  const [modalValue, setModalValue]   = useState('');
  const [modalHours, setModalHours]   = useState('');
  const [modalMins, setModalMins]     = useState('');
  const [modalNotes, setModalNotes]   = useState('');

  const dayStrip = useMemo(() => buildDayStrip(), []);

  //This finds the log entry for a given habit on the selected date
  function getLog(habitId: number): Log | undefined {
    return logs.find(l => l.habitId === habitId && l.date === selectedDate);
  }

  function getCategoryColour(categoryId: number) {
    return categories.find(c => c.id === categoryId)?.color ?? '#ccc';
  }

  function getCategoryName(categoryId: number) {
    return categories.find(c => c.id === categoryId)?.name ?? '';
  }

  //This shows a confirmation dialog before deleting a habit
  function confirmDelete(id: number) {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) },
    ]);
  }

  //This toggles a boolean habit's log or opens the value modal for numeric habits
  function handleComplete(habit: Habit) {
    const existing = getLog(habit.id);
    if (habit.metricType === 'boolean') {
      if (existing) {
        deleteLog(existing.id);
      } else {
        addLog(habit.id, selectedDate, 1, '');
      }
    } else {
      if (existing) {
        if (habit.unit === 'hrs/mins') {
          setModalHours(String(Math.floor(existing.value / 60)));
          setModalMins(String(existing.value % 60));
        } else {
          setModalValue(String(existing.value));
        }
        setModalNotes(existing.notes ?? '');
      } else {
        setModalValue('');
        setModalHours('');
        setModalMins('');
        setModalNotes('');
      }
      setModalHabit(habit);
    }
  }

  //This saves or updates the log entry from the modal
  async function handleModalSave() {
    if (!modalHabit) return;
    const existing = getLog(modalHabit.id);
    const finalValue = modalHabit.unit === 'hrs/mins'
      ? (Number(modalHours) * 60) + Number(modalMins)
      : Number(modalValue);
    if (existing) {
      await updateLog(existing.id, selectedDate, finalValue, modalNotes);
    } else {
      await addLog(modalHabit.id, selectedDate, finalValue, modalNotes);
    }
    setModalHabit(null);
  }

  //This filters habits by search text and selected category
  const search = searchText.trim().toLowerCase();
  const filteredHabits = habits.filter(h => {
    const matchesCat  = !selectedCategoryId || h.categoryId === parseInt(selectedCategoryId);
    const matchesText = !search || h.name.toLowerCase().includes(search);
    return matchesCat && matchesText;
  });

  const activeFilterCount = (search ? 1 : 0) + (selectedCategoryId ? 1 : 0);
  const filtersActive = activeFilterCount > 0;

  //This builds the category options for the dropdown with an 'All' option at the top
  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categories.map(c => ({ label: c.name, value: String(c.id), colour: c.color })),
  ];

  function clearFilters() {
    setSearchText('');
    setSelectedCat(null);
  }

  //This shows a spinner while habits are loading
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colours.primary} />
      </View>
    );
  }

  //This shows an error message if something went wrong fetching habits
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Habits</Text>

      {/*This is the 7 day date strip, tap a day to view logs for that date*/}
      <View style={styles.strip}>
        {dayStrip.map(day => {
          const active = day.date === selectedDate;
          return (
            <TouchableOpacity
              key={day.date}
              style={[styles.dayBtn, active && styles.dayBtnActive]}
              onPress={() => setSelectedDate(day.date)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`${day.dayName} ${day.dayNum}`}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.dayName, active && styles.dayTextActive]}>{day.dayName}</Text>
              <Text style={[styles.dayNum,  active && styles.dayTextActive]}>{day.dayNum}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/*This is the filter toggle button, the badge shows how many filters are active*/}
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

      {/*This is the expandable filter panel with search and category dropdown*/}
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
          //This works out the streak and completion state for each habit card
          const habitLogEntries = logs.filter(l => l.habitId === item.id);
          const dailyTarget  = targets.find(t => t.habitId === item.id && t.type === 'daily');
          const weeklyTarget = targets.find(t => t.habitId === item.id && t.type === 'weekly');
          const goalThreshold = dailyTarget?.goal
            ?? (weeklyTarget ? Math.floor(weeklyTarget.goal / 7) : 1);
          const streak = calcStreak(
            habitLogEntries.map(l => l.date),
            habitLogEntries.map(l => l.value),
            goalThreshold
          );
          const existing    = getLog(item.id);
          const isCompleted = !!existing;
          return (
            //This animates each card in with a staggered fade when the list renders
            <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
              <HabitCard
                name={item.name}
                unit={item.unit}
                metricType={item.metricType}
                categoryColor={getCategoryColour(item.categoryId)}
                categoryName={getCategoryName(item.categoryId)}
                streak={streak}
                isCompleted={isCompleted}
                onPress={() => router.push(`/habit/${item.id}`)}
                onLongPress={() => confirmDelete(item.id)}
                onComplete={() => handleComplete(item)}
              />
            </Animated.View>
          );
        }}

        //This changes the empty state message depending on whether filters are active
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>
              {filtersActive ? 'No habits match your filters.' : 'No habits yet.'}
            </Text>
            <Text style={styles.emptyHint}>
              {filtersActive ? 'Try adjusting your search or filters.' : 'Tap + to create your first habit.'}
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

      {/*This is the + button in the bottom right corner to add a new habit*/}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/habit/new')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add new habit"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/*This is the bottom sheet modal for logging a numeric habit value*/}
      <Modal
        visible={modalHabit !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setModalHabit(null)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.overlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>{modalHabit?.name}</Text>

                {/*This gives hrs/mins habits two fields and everything else one*/}
                {modalHabit?.unit === 'hrs/mins' ? (
                  <View style={styles.sheetRow}>
                    <View style={styles.sheetField}>
                      <FormField
                        label="Hours"
                        placeholder="0"
                        value={modalHours}
                        onChangeText={setModalHours}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.sheetField}>
                      <FormField
                        label="Minutes"
                        placeholder="0"
                        value={modalMins}
                        onChangeText={setModalMins}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                ) : (
                  <FormField
                    label={modalHabit?.unit ?? 'Value'}
                    placeholder={`Enter value in ${modalHabit?.unit ?? 'units'}`}
                    value={modalValue}
                    onChangeText={setModalValue}
                    keyboardType="numeric"
                  />
                )}

                <FormField
                  label="Notes (optional)"
                  placeholder="Any notes…"
                  value={modalNotes}
                  onChangeText={setModalNotes}
                  multiline
                />

                <TouchableOpacity
                  style={styles.modalSave}
                  onPress={handleModalSave}
                  accessibilityRole="button"
                  accessibilityLabel="Save log entry"
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setModalHabit(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}