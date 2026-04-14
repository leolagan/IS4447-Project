import { AppColors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);

  const { habits } = useHabits();
  const { logs, deleteLog } = useLogs(habitId);
  const { categories } = useCategories();

  const habit = habits.find(h => h.id === habitId);
  const category = categories.find(c => c.id === habit?.categoryId);

  function confirmDeleteLog(logId: number) {
    Alert.alert('Delete Log', 'Are you sure you want to delete this log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLog(logId) },
    ]);
  }

  function formatMinutes(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  function formatValue(value: number) {
    if (habit?.metricType === 'boolean') return value === 1 ? 'Done ✓' : 'Skipped';
    if (habit?.unit === 'hrs/mins') return formatMinutes(value);
    return `${value} ${habit?.unit ?? ''}`;
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
        >
          <Text style={styles.editHabitText}>Edit Habit</Text>
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
          <Text style={styles.unit}>{habit.unit}</Text>
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
                <Text style={styles.logDate}>{item.date}</Text>
                <Text style={styles.logValue}>{formatValue(item.value)}</Text>
                {item.notes ? <Text style={styles.logNotes}>{item.notes}</Text> : null}
              </View>
              <View style={styles.logActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push(`/log/edit/${item.id}`)}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmDeleteLog(item.id)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.empty}>No logs yet. Tap + to add one.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/log/new?habitId=${habitId}`)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: AppColors.background, padding: 16, paddingTop: 60 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  back:          { fontSize: 18, color: AppColors.primary, fontWeight: '500' },
  editHabitBtn:  { backgroundColor: AppColors.editLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  editHabitText: { color: AppColors.edit, fontWeight: '600', fontSize: 14 },
  habitCard: {
    backgroundColor: AppColors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  habitName:    { fontSize: 22, fontWeight: 'bold', color: AppColors.text },
  tagRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  tag:          { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  tagText:      { fontSize: 12, fontWeight: '600' },
  unit:         { fontSize: 13, color: AppColors.subtext },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text, marginBottom: 12 },
  logCard: {
    backgroundColor: AppColors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.border,
  },
  logLeft:       { flex: 1 },
  logDate:       { fontSize: 12, color: AppColors.subtext, marginBottom: 2 },
  logValue:      { fontSize: 17, fontWeight: '700', color: AppColors.text },
  logNotes:      { fontSize: 12, color: AppColors.subtext, marginTop: 4 },
  logActions:    { flexDirection: 'column', gap: 6, marginLeft: 12 },
  editBtn:       { backgroundColor: AppColors.editLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  editBtnText:   { color: AppColors.edit, fontWeight: '600', fontSize: 13 },
  deleteBtn:     { backgroundColor: AppColors.dangerLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText: { color: AppColors.danger, fontWeight: '600', fontSize: 13 },
  emptyContainer:{ alignItems: 'center', marginTop: 60 },
  emptyIcon:     { fontSize: 40, marginBottom: 10 },
  empty:         { fontSize: 15, color: AppColors.subtext },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: AppColors.primary,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 36 },
});
