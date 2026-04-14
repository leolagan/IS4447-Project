import { AppColors } from '@/constants/theme';
import { db } from '@/db/client';
import { habits } from '@/db/schema';
import { useCategories } from '@/hooks/useCategories';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CategoriesScreen() {
  const { categories, deleteCategory } = useCategories();
  const router = useRouter();
  const [habitCounts, setHabitCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    async function loadCounts() {
      const all = await db.select().from(habits);
      const counts: Record<number, number> = {};
      for (const h of all) {
        counts[h.categoryId] = (counts[h.categoryId] ?? 0) + 1;
      }
      setHabitCounts(counts);
    }
    loadCounts();
  }, [categories]);

  async function confirmDelete(id: number, name: string) {
    Alert.alert('Delete Category', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const error = await deleteCategory(id);
          if (error) {
            Alert.alert('Cannot Delete', error);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>

      <FlatList
        data={categories}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => {
          const count = habitCounts[item.id] ?? 0;
          return (
            <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
              <TouchableOpacity
                style={styles.card}
                onLongPress={() => confirmDelete(item.id, item.name)}
                activeOpacity={0.75}
              >
                <View style={[styles.swatch, { backgroundColor: item.color }]} />
                <View style={styles.cardBody}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.count}>
                    {count} habit{count !== 1 ? 's' : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push(`/category/edit/${item.id}`)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil-outline" size={18} color={AppColors.edit} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎨</Text>
            <Text style={styles.empty}>No categories yet. Tap + to add one.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/category/new')}
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
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    gap: 14,
  },
  swatch:         { width: 28, height: 28, borderRadius: 14 },
  cardBody:       { flex: 1 },
  name:           { fontSize: 16, fontWeight: '600', color: AppColors.text },
  count:          { fontSize: 13, color: AppColors.subtext, marginTop: 2 },
  editBtn:        { padding: 4 },
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
