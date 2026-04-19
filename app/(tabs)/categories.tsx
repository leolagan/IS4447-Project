import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { habits } from '@/db/schema';
import { useCategories } from '@/hooks/useCategories';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container:      { flex: 1, backgroundColor: c.background, padding: 16, paddingTop: 60 },
    centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
    errorText:      { color: c.danger, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
    title:          { fontSize: 30, fontWeight: 'bold', color: c.text, marginBottom: 20 },
    card: {
      backgroundColor: c.card,
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
    name:           { fontSize: 16, fontWeight: '600', color: c.text },
    count:          { fontSize: 13, color: c.subtext, marginTop: 2 },
    editBtn:        { backgroundColor: c.editLight, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 8 },
    editBtnText:    { color: c.edit, fontWeight: '600', fontSize: 13 },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
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

export default function CategoriesScreen() {
  const { categories, deleteCategory, isLoading, error } = useCategories();
  const { colours } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colours), [colours]);
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
          const err = await deleteCategory(id);
          if (err) {
            Alert.alert('Cannot Delete', err);
          }
        },
      },
    ]);
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
                accessibilityRole="button"
                accessibilityLabel={`${item.name} category`}
                accessibilityHint="Long press to delete"
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
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.name} category`}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No categories yet. Tap + to add one.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/category/new')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add new category"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
