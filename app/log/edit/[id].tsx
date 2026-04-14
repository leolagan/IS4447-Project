import FormField from '@/components/ui/FormField';
import { AppColors } from '@/constants/theme';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EditLogScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { habits } = useHabits();
  const { logs, updateLog } = useLogs();

  const [date, setDate] = useState('');
  const [value, setValue] = useState('');
  const [hours, setHours] = useState('');
  const [mins, setMins] = useState('');
  const [boolValue, setBoolValue] = useState(true);
  const [notes, setNotes] = useState('');
  const [habitId, setHabitId] = useState<number | null>(null);

  const habit = habits.find(h => h.id === habitId);

  useEffect(() => {
    const log = logs.find(l => l.id === Number(id));
    if (log) {
      setDate(log.date);
      setValue(log.value.toString());
      setBoolValue(log.value === 1);
      setNotes(log.notes ?? '');
      setHabitId(log.habitId);
      setHours(Math.floor(log.value / 60).toString());
      setMins((log.value % 60).toString());
    }
  }, [logs, id]);

  async function handleSave() {
    if (!date.trim()) {
      Alert.alert('Error', 'Please enter a date.');
      return;
    }

    const finalValue = habit?.metricType === 'boolean'
      ? (boolValue ? 1 : 0)
      : habit?.unit === 'hrs/mins'
        ? (Number(hours) * 60) + Number(mins)
        : Number(value);

    if (habit?.metricType === 'count' && isNaN(finalValue)) {
      Alert.alert('Error', 'Please enter a valid number.');
      return;
    }

    await updateLog(Number(id), date, finalValue, notes);
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Log</Text>

      {habit && (
        <View style={styles.habitBadge}>
          <Text style={styles.habitBadgeText}>{habit.name}</Text>
        </View>
      )}

      <FormField
        label="Date"
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
      />

      {habit?.metricType === 'boolean' ? (
        <View style={styles.boolRow}>
          <Text style={styles.label}>Completed?</Text>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, boolValue && styles.toggleActive]}
              onPress={() => setBoolValue(true)}
            >
              <Text style={[styles.toggleText, boolValue && styles.toggleTextActive]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !boolValue && styles.toggleActive]}
              onPress={() => setBoolValue(false)}
            >
              <Text style={[styles.toggleText, !boolValue && styles.toggleTextActive]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : habit?.unit === 'hrs/mins' ? (
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <FormField
              label="Hours"
              placeholder="0"
              value={hours}
              onChangeText={setHours}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.timeField}>
            <FormField
              label="Minutes"
              placeholder="0"
              value={mins}
              onChangeText={setMins}
              keyboardType="numeric"
            />
          </View>
        </View>
      ) : (
        <FormField
          label={`Value ${habit ? `(${habit.unit})` : ''}`}
          placeholder="e.g. 5"
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
        />
      )}

      <FormField
        label="Notes (optional)"
        placeholder="Any notes..."
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: AppColors.background, padding: 16, paddingTop: 60 },
  title:            { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: AppColors.text },
  habitBadge:       { backgroundColor: AppColors.primaryLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 20 },
  habitBadgeText:   { color: AppColors.primary, fontWeight: '600', fontSize: 14 },
  label:            { fontSize: 14, fontWeight: '600', marginBottom: 8, color: AppColors.text },
  boolRow:          { marginBottom: 16 },
  toggle:           { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: AppColors.border, overflow: 'hidden' },
  toggleBtn:        { flex: 1, padding: 12, alignItems: 'center', backgroundColor: AppColors.card },
  toggleActive:     { backgroundColor: AppColors.primary },
  toggleText:       { fontSize: 14, fontWeight: '500', color: AppColors.text },
  toggleTextActive: { color: '#fff' },
  timeRow:          { flexDirection: 'row', gap: 12 },
  timeField:        { flex: 1 },
  saveBtn:          { backgroundColor: AppColors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:      { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel:           { textAlign: 'center', color: AppColors.subtext, fontSize: 16, padding: 16 },
});
