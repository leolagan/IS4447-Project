import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { useTargets, type TargetWithProgress } from '@/hooks/useTargets';
import { formatValue } from '@/utils/formatters';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

function getBarColour(item: TargetWithProgress, c: typeof AppColours): string {
  if (item.isExceeded) return c.danger;
  if (item.isMet)      return c.success;
  return c.primary;
}

function getStatusChipStyles(item: TargetWithProgress, styles: ReturnType<typeof makeStyles>) {
  if (item.isExceeded) return { chip: styles.statusExceeded, text: styles.statusExceededText };
  if (item.isMet)      return { chip: styles.statusMet,      text: styles.statusMetText };
  return                      { chip: styles.statusPending,  text: styles.statusPendingText };
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

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container:         { flex: 1, backgroundColor: c.background, padding: 16, paddingTop: 20 },
    centered:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
    errorText:         { color: c.danger, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
    title:             { fontSize: 30, fontWeight: 'bold', fontFamily: 'Sora_700Bold', color: c.text, marginBottom: 20 },
    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'stretch',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    categoryBar:       { width: 5 },
    cardBody:          { flex: 1, padding: 20 },
    headerRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    habitName:         { fontSize: 16, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.text, flex: 1, marginRight: 8 },
    typeBadge:         { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    weeklyBadge:       { backgroundColor: c.primaryLight },
    monthlyBadge:      { backgroundColor: c.editLight },
    typeBadgeText:     { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    directionText:     { fontSize: 13, color: c.subtext, marginBottom: 10 },
    progressTrack:     { height: 10, backgroundColor: c.border, borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
    bottomRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    progressText:      { fontSize: 13, color: c.text, fontWeight: '500' },
    statusChip:        { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    statusMet:         { backgroundColor: c.primaryLight },
    statusExceeded:    { backgroundColor: c.dangerLight },
    statusPending:     { backgroundColor: c.background },
    statusText:        { fontSize: 12, fontWeight: '600' },
    statusMetText:     { color: c.success },
    statusExceededText:{ color: c.danger },
    statusPendingText: { color: c.subtext },
    emptyContainer:    { alignItems: 'center', marginTop: 80 },
    empty:             { fontSize: 16, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.text },
    emptyHint:         { fontSize: 13, color: c.subtext, marginTop: 8, textAlign: 'center', fontFamily: 'Sora_400Regular', paddingHorizontal: 32 },
    fab: {
      position: 'absolute', bottom: 32, right: 24,
      backgroundColor: c.primary,
      width: 58, height: 58, borderRadius: 29,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
    },
    fabText: { color: '#fff', fontSize: 32, lineHeight: 36 },
  });
}

export default function TargetsScreen() {
  const { targets, deleteTarget, isLoading, error } = useTargets();
  const { categories } = useCategories();
  const { colours } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colours), [colours]);
  const getChipStyles = (item: TargetWithProgress) => getStatusChipStyles(item, styles);

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
      <Text style={styles.title}>My Targets</Text>

      <FlatList
        data={targets}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => {
          const catColour = getCategoryColour(item.habitCategoryId);
          const fillPct   = Math.min(item.progress / item.goal, 1);
          const barColour = getBarColour(item, colours);

          return (
            <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/target/edit/${item.id}`)}
                onLongPress={() => confirmDelete(item.id)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${item.habitName} target`}
                accessibilityHint="Tap to edit, long press to delete"
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
                        { color: colours.primary },
                      ]}>
                        {item.type === 'weekly' ? 'WEEKLY' : 'MONTHLY'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.directionText}>{getDirectionLabel(item)}</Text>

                  <View style={styles.progressTrack}>
                    <View style={{
                      height: 10,
                      borderRadius: 5,
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
                    <View style={[styles.statusChip, getChipStyles(item).chip]}>
                      <Text style={[styles.statusText, getChipStyles(item).text]}>
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
            <Text style={styles.empty}>No targets yet.</Text>
            <Text style={styles.emptyHint}>Tap + to set a weekly or monthly goal for any habit.</Text>
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
