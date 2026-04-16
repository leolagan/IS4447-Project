import DropdownPicker from '@/components/ui/DropdownPicker';
import FormField from '@/components/ui/FormField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { formatDisplayDate, parseDisplayDate } from '@/utils/dateHelpers';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

function getValuePlaceholder(unit: string): string {
  if (unit === 'hrs/mins') return '';
  return `e.g. 5 ${unit}`;
}

export default function NewLogScreen() {
  const router = useRouter();
  const { habitId } = useLocalSearchParams<{ habitId: string }>();

  const { habits } = useHabits();
  const { addLog } = useLogs();

  const today = formatDisplayDate(new Date().toISOString().split('T')[0]);

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

    await addLog(selectedHabitId, parseDisplayDate(date), finalValue, notes);
    router.back();
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
          placeholder="DD/MM/YYYY"
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
                placeholder="Hours"
                value={hours}
                onChangeText={setHours}
                keyboardType="numeric"
                editable={!!habit}
              />
            </View>
            <View style={styles.timeField}>
              <FormField
                label="Minutes"
                placeholder="Minutes"
                value={mins}
                onChangeText={setMins}
                keyboardType="numeric"
                editable={!!habit}
              />
            </View>
          </View>
        ) : (
          <FormField
            label="Value"
            placeholder={habit ? getValuePlaceholder(habit.unit) : 'Select a habit first'}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            editable={!!habit}
          />
        )}

        <FormField
          label="Notes (optional)"
          placeholder="Any notes..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <PrimaryButton title="Save Log" onPress={handleSave} />

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
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
  cancel:           { textAlign: 'center', color: AppColours.subtext, fontSize: 16, padding: 16 },
});
