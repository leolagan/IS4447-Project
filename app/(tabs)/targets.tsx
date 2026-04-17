import { AppColours } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useTargets, type TargetWithProgress } from '@/hooks/useTargets';
import { formatValue } from '@/utils/formatters';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

function getBarColour(item: TargetWithProgress): string {
  if (item.isExceeded) return '#FA5252';
  if (item.isMet) return '#51CF66';
  return AppColours.primary;
}

function getStatusLabel(item: TargetWithProgress): string {
  if (item.isExceeded) {
    const over = item.progress - item.goal;
    return `+${formatValue(over, item.habitUnit, item.habitMetricType)} over`;
  }
  if (item.isMet) return 'Met ✓';
  const remaining = item.goal - item.progress;
  return `${formatValue(remaining, item.habitUnit, item.habitMetricType)} to go`;
}

export default function TargetsScreen() {
  const { targets, deleteTarget, isLoading, error } = useTargets();
  const { categories } = useCategories();
  const router = useRouter();

  function getCategoryColour(categoryId: number): string {
    return categories.find(c => c.id === categoryId)?.color ?? '#ccc';
  }

  function confirmDelete(id: number) {
    Alert.alert('Delete Target', 'Are you sure you want to delete this target?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTarget(id) },
    ]);
  }

  function getDirectionLabel(item: TargetWithProgress): string {
    const dirText = item.direction === 'min' ? 'At least' : 'No more than';
    const goalFormatted = formatValue(item.goal, item.habitUnit, item.habitMetricType);
    const period = item.type === 'weekly' ? 'this week' : 'this month';
    return `${dirText} ${goalFormatted} ${period}`;
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={AppColours.primary} />
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
      <Text style={styles.title}>My Targets</Text>

      <FlatList
        data={targets}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => {
          const catColour = getCategoryColour(item.habitCategoryId);
          const fillPct   = Math.min(item.progress / item.goal, 1);
          const barColour = getBarColour(item);

          return (
            <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/target/edit/${item.id}`)}
                onLongPress={() => confirmDelete(item.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.categoryBar, { backgroundColor: catColour }]} />
                <View style={styles.cardBody}>
                  <View style={styles.headerRow}>
                    <Text style={styles.habitName}>{item.habitName}</Text>
                    <View style={[
                      styles.typeBadge,
                      item.type === 'weekly' ? styles.weeklyBadge : styles.monthlyBadge,
                    ]}>
                      <Text style={[
                        styles.typeBadgeText,
                        { color: item.type === 'weekly' ? '#1971C2' : '#862E9C' },
                      ]}>
                        {item.type === 'weekly' ? 'WEEKLY' : 'MONTHLY'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.directionText}>{getDirectionLabel(item)}</Text>

                  <View style={styles.progressTrack}>
                    <View style={{
                      height: 8,
                      borderRadius: 4,
                      width: `${Math.round(fillPct * 100)}%`,
                      backgroundColor: barColour,
                    }} />
                  </View>

                  <View style={styles.bottomRow}>
                    <Text style={styles.progressText}>
                      {formatValue(item.progress, item.habitUnit, item.habitMetricType)}
                      {' / '}
                      {formatValue(item.goal, item.habitUnit, item.habitMetricType)}
                    </Text>
                    <View style={[
                      styles.statusChip,
                      item.isExceeded ? styles.statusExceeded : item.isMet ? styles.statusMet : styles.statusPending,
                    ]}>
                      <Text style={[
                        styles.statusText,
                        item.isExceeded ? styles.statusExceededText : item.isMet ? styles.statusMetText : styles.statusPendingText,
                      ]}>
                        {getStatusLabel(item)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No targets yet. Tap + to add one.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/target/new')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add new target"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: AppColours.background, padding: 16, paddingTop: 60 },
  centered:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColours.background },
  errorText:         { color: AppColours.danger, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
  title:             { fontSize: 30, fontWeight: 'bold', color: AppColours.text, marginBottom: 20 },
  card: {
    backgroundColor: AppColours.card,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryBar:       { width: 5 },
  cardBody:          { flex: 1, padding: 16 },
  headerRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  habitName:         { fontSize: 16, fontWeight: '600', color: AppColours.text, flex: 1, marginRight: 8 },
  typeBadge:         { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  weeklyBadge:       { backgroundColor: '#E7F5FF' },
  monthlyBadge:      { backgroundColor: '#F3D9FA' },
  typeBadgeText:     { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  directionText:     { fontSize: 13, color: AppColours.subtext, marginBottom: 10 },
  progressTrack:     { height: 8, backgroundColor: AppColours.border, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  bottomRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressText:      { fontSize: 13, color: AppColours.text, fontWeight: '500' },
  statusChip:        { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  statusMet:         { backgroundColor: '#EBFBEE' },
  statusExceeded:    { backgroundColor: '#FFF0F0' },
  statusPending:     { backgroundColor: AppColours.background },
  statusText:        { fontSize: 12, fontWeight: '600' },
  statusMetText:     { color: '#2F9E44' },
  statusExceededText:{ color: '#FA5252' },
  statusPendingText: { color: AppColours.subtext },
  emptyContainer:    { alignItems: 'center', marginTop: 80 },
  emptyIcon:         { fontSize: 48, marginBottom: 12 },
  empty:             { fontSize: 15, color: AppColours.subtext },
  fab: {
    position: 'absolute', bottom: 32, right: 24,
    backgroundColor: AppColours.primary,
    width: 58, height: 58, borderRadius: 29,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: AppColours.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 36 },
});
