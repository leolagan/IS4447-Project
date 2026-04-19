import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { formatDisplayDate } from '@/utils/dateHelpers';
import { formatUnit, formatValue as sharedFormatValue } from '@/utils/formatters';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container:     { flex: 1, backgroundColor: c.background, padding: 16, paddingTop: 60 },
    header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    back:          { fontSize: 18, color: c.primary, fontWeight: '500' },
    editHabitBtn:  { padding: 6 },
    habitCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderLeftWidth: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    habitName:    { fontSize: 24, fontWeight: 'bold', fontFamily: 'Sora_700Bold', color: c.text },
    tagRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
    tag:          { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
    tagText:      { fontSize: 12, fontWeight: '600', fontFamily: 'Sora_600SemiBold' },
    unit:         { fontSize: 13, color: c.subtext, fontFamily: 'Sora_400Regular' },
    sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Sora_700Bold', color: c.text, marginBottom: 16 },
    logCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      borderLeftWidth: 4,
      borderLeftColor: c.border,
    },
    logLeft:       { flex: 1 },
    logDate:       { fontSize: 12, color: c.subtext, marginBottom: 2, fontFamily: 'Sora_400Regular' },
    logValue:      { fontSize: 17, fontWeight: '700', fontFamily: 'Sora_600SemiBold', color: c.text },
    logNotes:      { fontSize: 12, color: c.subtext, marginTop: 4, fontFamily: 'Sora_400Regular' },
    logActions:    { flexDirection: 'row', gap: 6, marginLeft: 12 },
    editBtn:   { backgroundColor: c.editLight, padding: 10, borderRadius: 10 },
    deleteBtn: { backgroundColor: c.dangerLight, padding: 10, borderRadius: 10 },
    emptyContainer:{ alignItems: 'center', marginTop: 60 },
    empty:         { fontSize: 15, color: c.subtext },
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

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);

  const { habits } = useHabits();
  const { logs, deleteLog } = useLogs(habitId);
  const { categories } = useCategories();
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const habit = habits.find(h => h.id === habitId);
  const category = categories.find(c => c.id === habit?.categoryId);

  function confirmDeleteLog(logId: number) {
    Alert.alert('Delete Log', 'Are you sure you want to delete this log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLog(logId) },
    ]);
  }

  function formatValue(value: number) {
    if (habit?.metricType === 'boolean') return value === 1 ? 'Done' : 'Not Done';
    return sharedFormatValue(value, habit?.unit ?? '', habit?.metricType ?? '');
  }

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text>Habit not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editHabitBtn}
          onPress={() => router.push(`/habit/edit/${habitId}`)}
          accessibilityRole="button"
          accessibilityLabel="Edit habit"
        >
          <Feather name="edit-2" size={20} color={colours.edit} />
        </TouchableOpacity>
      </View>

      <View style={[styles.habitCard, { borderLeftColor: category?.color ?? '#ccc' }]}>
        <Text style={styles.habitName}>{habit.name}</Text>
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: (category?.color ?? '#ccc') + '25' }]}>
            <Text style={[styles.tagText, { color: category?.color ?? '#ccc' }]}>
              {category?.name}
            </Text>
          </View>
          <Text style={styles.unit}>{formatUnit(habit.unit, habit.metricType)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Logs</Text>

      <FlatList
        data={[...logs].sort((a, b) => b.date.localeCompare(a.date))}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
            <View style={styles.logCard}>
              <View style={styles.logLeft}>
                <Text style={styles.logDate}>{formatDisplayDate(item.date)}</Text>
                <Text style={styles.logValue}>{formatValue(item.value)}</Text>
                {item.notes ? <Text style={styles.logNotes}>{item.notes}</Text> : null}
              </View>
              <View style={styles.logActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push(`/log/edit/${item.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel="Edit log"
                  hitSlop={{ top: 8, bottom: 8 }}
                >
                  <Feather name="edit-2" size={15} color={colours.edit} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmDeleteLog(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Delete log"
                  hitSlop={{ top: 8, bottom: 8 }}
                >
                  <Feather name="trash-2" size={15} color={colours.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No logs yet. Tap + to add one.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/log/new?habitId=${habitId}`)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add log for this habit"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
