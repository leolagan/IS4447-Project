import DropdownPicker from '@/components/ui/DropdownPicker';
import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { habitLogs, habits } from '@/db/schema';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { useTargets } from '@/hooks/useTargets';
import { formatMinutes, formatValue } from '@/utils/formatters';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = 'daily' | 'weekly' | 'monthly';
type ChartBar = { label: string; value: number };
type Log = typeof habitLogs.$inferSelect;
type Habit = typeof habits.$inferSelect;

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatYLabel(value: number, unit: string, metricType: string): string {
  if (value === 0) return '0';
  if (unit === 'hrs/mins') return formatMinutes(Math.round(value));
  if (metricType === 'boolean') return `${value}×`;
  if (value >= 10000) return `${Math.round(value / 1000)}k ${unit}`;
  if (value >= 1000)  return `${(value / 1000).toFixed(1)}k ${unit}`;
  return `${value} ${unit}`;
}

// ─── Data bucketing ──────────────────────────────────────────────────────────

function sumLogs(logs: Log[], habit: Habit): number {
  if (habit.metricType === 'boolean') return logs.filter(l => l.value === 1).length;
  return logs.reduce((s, l) => s + l.value, 0);
}

function getDailyBuckets(logs: Log[], habit: Habit): ChartBar[] {
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const bars: ChartBar[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const bucket = logs.filter(l => l.habitId === habit.id && l.date === dateStr);
    bars.push({ label: DAY[d.getDay()], value: sumLogs(bucket, habit) });
  }
  return bars;
}

function getWeeklyBuckets(logs: Log[], habit: Habit): ChartBar[] {
  const MON_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  currentMonday.setHours(0, 0, 0, 0);
  const bars: ChartBar[] = [];
  for (let i = 7; i >= 0; i--) {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() - i * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const start = monday.toISOString().split('T')[0];
    const end   = sunday.toISOString().split('T')[0];
    const bucket = logs.filter(l => l.habitId === habit.id && l.date >= start && l.date <= end);
    bars.push({ label: `${monday.getDate()} ${MON_NAMES[monday.getMonth()]}`, value: sumLogs(bucket, habit) });
  }
  return bars;
}

function getMonthlyBuckets(logs: Log[], habit: Habit): ChartBar[] {
  const MON_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const bars: ChartBar[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const firstDay = d.toISOString().split('T')[0];
    const lastDay  = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    const bucket = logs.filter(l => l.habitId === habit.id && l.date >= firstDay && l.date <= lastDay);
    bars.push({ label: MON_NAMES[d.getMonth()], value: sumLogs(bucket, habit) });
  }
  return bars;
}

// ─── BarChart ─────────────────────────────────────────────────────────────────

function BarChart({ bars, colour, unit, metricType, colours }: {
  bars: ChartBar[];
  colour: string;
  unit: string;
  metricType: string;
  colours: typeof AppColours;
}) {
  const CHART_H = 140;
  const LABEL_H = 22;
  const Y_WIDTH  = 58;
  const maxVal   = Math.max(...bars.map(b => b.value), 1);

  const rawTicks = [maxVal, Math.round(maxVal / 2), 0];
  const ticks    = rawTicks.filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: Y_WIDTH, paddingRight: 6 }}>
        <View style={{ height: CHART_H, justifyContent: 'space-between' }}>
          {ticks.map((tick, i) => (
            <Text key={i} style={{ fontSize: 8, color: colours.subtext, textAlign: 'right' }}>
              {formatYLabel(tick, unit, metricType)}
            </Text>
          ))}
        </View>
        <View style={{ height: LABEL_H }} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ height: CHART_H, flexDirection: 'row', alignItems: 'flex-end' }}>
          {[0, 0.5, 1].map((frac, i) => (
            <View
              key={`g${i}`}
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: Math.round(frac * (CHART_H - 1)),
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: colours.border,
                opacity: 0.6,
              }}
            />
          ))}

          {bars.map((bar, i) => {
            const barH = bar.value > 0
              ? Math.max((bar.value / maxVal) * CHART_H, 5)
              : 3;
            return (
              <View
                key={i}
                style={{ flex: 1, height: CHART_H, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 2 }}
              >
                <View
                  style={{
                    width: '75%',
                    height: barH,
                    backgroundColor: bar.value > 0 ? colour : colours.border,
                    borderRadius: 4,
                  }}
                />
              </View>
            );
          })}
        </View>

        <View style={{ height: LABEL_H, flexDirection: 'row' }}>
          {bars.map((bar, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', paddingTop: 5 }}>
              <Text style={{ fontSize: 8, color: colours.subtext, textAlign: 'center' }}>{bar.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, colours }: { label: string; value: string; colours: typeof AppColours }) {
  const styles = useMemo(() => StyleSheet.create({
    statCard: {
      width: '47.5%',
      backgroundColor: colours.card,
      borderRadius: 14,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    statLabel: { fontSize: 12, color: colours.subtext, marginBottom: 6, fontWeight: '500' },
    statValue: { fontSize: 22, fontWeight: '700', color: colours.text },
  }), [colours]);

  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

// ─── makeStyles ───────────────────────────────────────────────────────────────

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
    errorText: { color: c.danger, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
    content:   { padding: 16, paddingTop: 60, paddingBottom: 48 },
    title:     { fontSize: 30, fontWeight: 'bold', color: c.text, marginBottom: 20 },

    toggleRow: {
      flexDirection: 'row',
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    toggleBtn:        { flex: 1, paddingVertical: 12, minHeight: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    toggleBtnActive:  { backgroundColor: c.primary },
    toggleText:       { fontSize: 14, fontWeight: '600', color: c.subtext },
    toggleTextActive: { color: '#fff' },

    card: {
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    cardTitle:    { fontSize: 17, fontWeight: '700', color: c.text, marginBottom: 2 },
    cardSubtitle: { fontSize: 13, color: c.subtext, marginBottom: 16 },

    noDataBox:  { alignItems: 'center', paddingVertical: 36 },
    noDataText: { fontSize: 14, color: c.subtext },

    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: c.subtext,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

    emptyBox:  { alignItems: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 15, color: c.subtext, textAlign: 'center', lineHeight: 22 },
  });
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const { logs, isLoading, error } = useLogs();
  const { habits }                 = useHabits();
  const { categories }             = useCategories();
  const { targets }                = useTargets();
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const [period, setPeriod]                   = useState<Period>('daily');
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

  const selectedHabit = useMemo(
    () => habits.find(h => h.id === selectedHabitId) ?? null,
    [habits, selectedHabitId]
  );

  const isLowerBetter = useMemo(
    () => targets.some(t => t.habitId === selectedHabitId && t.direction === 'max'),
    [targets, selectedHabitId]
  );

  function getCategoryColour(categoryId: number): string {
    return categories.find(c => c.id === categoryId)?.color ?? colours.primary;
  }

  const habitOptions = useMemo(
    () => habits.map(h => ({
      label:  h.name,
      value:  String(h.id),
      colour: getCategoryColour(h.categoryId),
    })),
    [habits, categories]
  );

  const chartBars = useMemo<ChartBar[]>(() => {
    if (!selectedHabit) return [];
    if (period === 'daily')   return getDailyBuckets(logs, selectedHabit);
    if (period === 'weekly')  return getWeeklyBuckets(logs, selectedHabit);
    return getMonthlyBuckets(logs, selectedHabit);
  }, [logs, selectedHabit, period]);

  const stats = useMemo(() => {
    if (!selectedHabit || chartBars.length === 0) return null;
    const { unit, metricType } = selectedHabit;
    const total   = chartBars.reduce((s, b) => s + b.value, 0);
    const avg     = total / chartBars.length;
    const nonZero = chartBars.filter(b => b.value > 0);
    const best    = isLowerBetter
      ? (nonZero.length > 0 ? Math.min(...nonZero.map(b => b.value)) : 0)
      : Math.max(...chartBars.map(b => b.value));
    const active  = nonZero.length;
    return {
      total:  formatValue(total, unit, metricType),
      avg:    formatValue(Math.round(avg * 10) / 10, unit, metricType),
      best:   formatValue(best, unit, metricType),
      active: `${active}`,
    };
  }, [chartBars, selectedHabit, isLowerBetter]);

  const periodSubtitle: Record<Period, string> = {
    daily:   'Last 7 days',
    weekly:  'Last 8 weeks',
    monthly: 'Last 6 months',
  };

  const avgLabel: Record<Period, string> = {
    daily:   'Avg / day',
    weekly:  'Avg / week',
    monthly: 'Avg / month',
  };

  const activeLabel: Record<Period, string> = {
    daily:   'Days logged',
    weekly:  'Weeks active',
    monthly: 'Months active',
  };

  const barColour = selectedHabit
    ? getCategoryColour(selectedHabit.categoryId)
    : colours.primary;

  const hasData = chartBars.some(b => b.value > 0);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Insights</Text>

      <View style={styles.toggleRow}>
        {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.toggleBtn, period === p && styles.toggleBtnActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={p + ' view'}
            accessibilityState={{ selected: period === p }}
          >
            <Text style={[styles.toggleText, period === p && styles.toggleTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No habits yet.{'\n'}Add some habits to see insights.</Text>
        </View>
      ) : (
        <>
          <DropdownPicker
            label="Habit"
            options={habitOptions}
            selected={selectedHabitId !== null ? String(selectedHabitId) : null}
            placeholder="Select a habit..."
            onSelect={val => setSelectedHabitId(Number(val))}
          />

          <View style={styles.card}>
            {selectedHabit ? (
              <>
                <Text style={styles.cardTitle}>{selectedHabit.name}</Text>
                <Text style={styles.cardSubtitle}>
                  {periodSubtitle[period]}
                  {'  ·  '}
                  {selectedHabit.metricType === 'boolean'
                    ? 'completions'
                    : selectedHabit.unit === 'hrs/mins'
                    ? 'hours & mins'
                    : selectedHabit.unit}
                </Text>
                {hasData ? (
                  <BarChart
                    bars={chartBars}
                    colour={barColour}
                    unit={selectedHabit.unit}
                    metricType={selectedHabit.metricType}
                    colours={colours}
                  />
                ) : (
                  <View style={styles.noDataBox}>
                    <Text style={styles.noDataText}>No logs in this period</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noDataBox}>
                <Text style={styles.noDataText}>Select a habit above to view its chart</Text>
              </View>
            )}
          </View>

          {stats && (
            <>
              <Text style={styles.sectionLabel}>Summary</Text>
              <View style={styles.statsGrid}>
                <StatCard label="Total"                                     value={stats.total}  colours={colours} />
                <StatCard label={avgLabel[period]}                          value={stats.avg}    colours={colours} />
                <StatCard label={isLowerBetter ? 'Best (lowest)' : 'Best'} value={stats.best}   colours={colours} />
                <StatCard label={activeLabel[period]}                       value={stats.active} colours={colours} />
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}
