import { AppColours } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useRouter } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HabitsScreen() {
  const { habits, deleteHabit } = useHabits();
  const { categories } = useCategories();
  const router = useRouter();

  function getCategoryColour(categoryId: number) {
    return categories.find(c => c.id === categoryId)?.colour ?? '#ccc';
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Habits</Text>

      <FlatList
        data={habits}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/habit/${item.id}`)}
              onLongPress={() => confirmDelete(item.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.categoryBar, { backgroundColor: getCategoryColour(item.categoryId) }]} />
              <View style={styles.cardBody}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.tagRow}>
                  <View style={[styles.tag, { backgroundColor: getCategoryColour(item.categoryId) + '25' }]}>
                    <Text style={[styles.tagText, { color: getCategoryColour(item.categoryId) }]}>
                      {getCategoryName(item.categoryId)}
                    </Text>
                  </View>
                  <Text style={styles.unit}>{item.unit}</Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.empty}>No habits yet. Tap + to add one.</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/habit/new')} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: AppColours.background, padding: 16, paddingTop: 60 },
  title:        { fontSize: 30, fontWeight: 'bold', color: AppColours.text, marginBottom: 20 },
  card: {
    backgroundColor: AppColours.card,
    borderRadius: 14,
    marginBottom: 12,
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
  cardBody:       { flex: 1, padding: 16 },
  name:           { fontSize: 16, fontWeight: '600', color: AppColours.text },
  tagRow:         { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  tag:            { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  tagText:        { fontSize: 12, fontWeight: '600' },
  unit:           { fontSize: 12, color: AppColours.subtext },
  arrow:          { fontSize: 22, color: AppColours.border, paddingRight: 14 },
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
