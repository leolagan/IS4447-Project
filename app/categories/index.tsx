import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { habits } from '@/db/schema';
import { useCategories } from '@/hooks/useCategories';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container:      { flex: 1, backgroundColor: c.background },
    header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, gap: 12 },
    backBtn:        { padding: 4 },
    title:          { fontSize: 28, fontWeight: 'bold', fontFamily: 'Sora_700Bold', color: c.text, flex: 1 },
    centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
    errorText:      { color: c.danger, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
    list:           { paddingHorizontal: 16, paddingBottom: 100 },
    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      gap: 14,
    },
    swatch:         { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    cardBody:       { flex: 1 },
    name:           { fontSize: 16, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.text },
    count:          { fontSize: 13, color: c.subtext, marginTop: 2, fontFamily: 'Sora_400Regular' },
    actions:        { flexDirection: 'row', gap: 8 },
    iconBtn:        { padding: 10, borderRadius: 10 },
    editIconBtn:    { backgroundColor: c.editLight },
    deleteIconBtn:  { backgroundColor: c.dangerLight },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    empty:          { fontSize: 15, color: c.subtext, fontFamily: 'Sora_400Regular' },
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
          if (err) Alert.alert('Cannot Delete', err);
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={colours.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Categories</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const count = habitCounts[item.id] ?? 0;
          return (
            <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
              <View style={styles.card}>
                <View style={[styles.swatch, { backgroundColor: item.color }]}>
                  {item.icon && (
                    <Ionicons name={item.icon as any} size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.count}>{count} habit{count !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.iconBtn, styles.editIconBtn]}
                    onPress={() => router.push(`/category/edit/${item.id}`)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${item.name} category`}
                  >
                    <Feather name="edit-2" size={16} color={colours.edit} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconBtn, styles.deleteIconBtn]}
                    onPress={() => confirmDelete(item.id, item.name)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.name} category`}
                  >
                    <Feather name="trash-2" size={16} color={colours.danger} />
                  </TouchableOpacity>
                </View>
              </View>
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
