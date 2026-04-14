import { AppColors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { useRouter } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function LogsScreen() {
  const router = useRouter();
  const { logs, deleteLog } = useLogs();
  const { habits } = useHabits();
  const { categories } = useCategories();

  function getHabit(habitId: number) {
    return habits.find(h => h.id === habitId);
  }

  function getCategoryColor(habitId: number) {
    const habit = getHabit(habitId);
    return categories.find(c => c.id === habit?.categoryId)?.color ?? '#ccc';
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
    if (habit.metricType === 'boolean') return value === 1 ? 'Done ✓' : 'Skipped';
    if (habit.unit === 'hrs/mins') return formatMinutes(value);
    return `${value} ${habit.unit}`;
  }

  function confirmDelete(id: number) {
    Alert.alert('Delete Log', 'Are you sure you want to delete this log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLog(id) },
    ]);
  }

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  // Group logs by date
  const grouped: { date: string; data: typeof logs }[] = [];
  sorted.forEach(log => {
    const existing = grouped.find(g => g.date === log.date);
    if (existing) {
      existing.data.push(log);
    } else {
      grouped.push({ date: log.date, data: [log] });
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Logs</Text>

      <FlatList
        data={grouped}
        keyExtractor={item => item.date}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.empty}>No logs yet. Tap + to add one.</Text>
          </View>
        }
        renderItem={({ item: group, index: groupIndex }) => (
          <Animated.View entering={FadeInDown.delay(groupIndex * 60).springify()}>
            <Text style={styles.dateHeader}>{group.date}</Text>
            {group.data.map(log => (
              <View key={log.id} style={styles.logCard}>
                <View style={[styles.categoryBar, { backgroundColor: getCategoryColor(log.habitId) }]} />
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
  container:      { flex: 1, backgroundColor: AppColors.background, padding: 16, paddingTop: 60 },
  title:          { fontSize: 30, fontWeight: 'bold', color: AppColors.text, marginBottom: 20 },
  dateHeader:     { fontSize: 13, fontWeight: '700', color: AppColors.subtext, marginBottom: 8, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  logCard: {
    backgroundColor: AppColors.card,
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
  categoryBar:    { width: 5, alignSelf: 'stretch' },
  logBody:        { flex: 1, padding: 14 },
  habitName:      { fontSize: 14, fontWeight: '700', color: AppColors.text },
  logValue:       { fontSize: 16, fontWeight: '600', color: AppColors.primary, marginTop: 2 },
  logNotes:       { fontSize: 12, color: AppColors.subtext, marginTop: 4 },
  logActions:     { flexDirection: 'column', gap: 6, paddingRight: 12 },
  editBtn:        { backgroundColor: AppColors.editLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  editBtnText:    { color: AppColors.edit, fontWeight: '600', fontSize: 12 },
  deleteBtn:      { backgroundColor: AppColors.dangerLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  deleteBtnText:  { color: AppColors.danger, fontWeight: '600', fontSize: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon:      { fontSize: 48, marginBottom: 12 },
  empty:          { fontSize: 15, color: AppColors.subtext },
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
