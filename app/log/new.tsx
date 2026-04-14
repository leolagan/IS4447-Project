import DropdownPicker from '@/components/ui/DropdownPicker';
import FormField from '@/components/ui/FormField';
import { AppColours } from '@/constants/theme';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NewLogScreen() {
  const router = useRouter();
  const { habitId } = useLocalSearchParams<{ habitId: string }>();

  const { habits } = useHabits();
  const { addLog } = useLogs();

  const today = new Date().toISOString().split('T')[0];

  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(
    habitId ? Number(habitId) : null
  );
  const [date, setDate] = useState(today);
  const [value, setValue] = useState('');
  const [hours, setHours] = useState('');
  const [mins, setMins] = useState('');
  const [boolValue, setBoolValue] = useState(true);
  const [notes, setNotes] = useState('');

  const habit = habits.find(h => h.id === selectedHabitId);

  const habitOptions = habits.map(h => ({ label: h.name, value: String(h.id) }));

  async function handleSave() {
    if (!selectedHabitId) {
      Alert.alert('Error', 'Please select a habit.');
      return;
    }
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

    await addLog(selectedHabitId, date, finalValue, notes);
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Log</Text>

      <DropdownPicker
        label="Habit"
        options={habitOptions}
        selected={selectedHabitId !== null ? String(selectedHabitId) : null}
        placeholder="Select a habit..."
        onSelect={value => setSelectedHabitId(Number(value))}
      />

      <FormField
        label="Date"
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
      />

      {habit?.metricType === 'boolean' ? (
        <View style={styles.boolRow}>
          <Text style={styles.label}>Done?</Text>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, boolValue && styles.toggleActive]}
              onPress={() => setBoolValue(true)}
            >
              <Text style={[styles.toggleText, boolValue && styles.toggleTextActive]}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !boolValue && styles.toggleActive]}
              onPress={() => setBoolValue(false)}
            >
              <Text style={[styles.toggleText, !boolValue && styles.toggleTextActive]}>Not Done</Text>
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
        <Text style={styles.saveBtnText}>Save Log</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: AppColours.background, padding: 16, paddingTop: 60 },
  title:            { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: AppColours.text },
  label:            { fontSize: 14, fontWeight: '600', marginBottom: 8, color: AppColours.text },
  boolRow:          { marginBottom: 16 },
  toggle:           { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: AppColours.border, overflow: 'hidden' },
  toggleBtn:        { flex: 1, padding: 12, alignItems: 'center', backgroundColor: AppColours.card },
  toggleActive:     { backgroundColor: AppColours.primary },
  toggleText:       { fontSize: 14, fontWeight: '500', color: AppColours.text },
  toggleTextActive: { color: '#fff' },
  timeRow:          { flexDirection: 'row', gap: 12 },
  timeField:        { flex: 1 },
  saveBtn:          { backgroundColor: AppColours.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:      { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel:           { textAlign: 'center', color: AppColours.subtext, fontSize: 16, padding: 16 },
});
