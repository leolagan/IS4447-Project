//This imports all the components and contexts needed for the new log screen
import DropdownPicker from '@/components/ui/DropdownPicker';
import FormField from '@/components/ui/FormField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useHabitsContext } from '@/context/HabitsContext';
import { useTheme } from '@/context/ThemeContext';
import { useLogs } from '@/hooks/useLogs';
import { formatDisplayDate, isValidDisplayDate, parseDisplayDate } from '@/utils/dateHelpers';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

//This returns the placeholder text for the value input based on the habit's unit
function getValuePlaceholder(unit: string): string {
  if (unit === 'hrs/mins') return '';
  return `e.g. 5 ${unit}`;
}

//This generates a stylesheet from the current theme colours
function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container:        { flex: 1, backgroundColor: c.background, padding: 16, paddingTop: 56 },
    title:            { fontSize: 30, fontWeight: 'bold', fontFamily: 'Sora_700Bold', marginBottom: 28, color: c.text },
    label:            { fontSize: 14, fontWeight: '600', fontFamily: 'Sora_600SemiBold', marginBottom: 8, color: c.text },
    boolRow:          { marginBottom: 16 },
    toggle:           { flexDirection: 'row', borderRadius: 12, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
    toggleBtn:        { flex: 1, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', backgroundColor: c.card },
    toggleActive:     { backgroundColor: c.primary },
    toggleText:       { fontSize: 14, fontWeight: '500', fontFamily: 'Sora_400Regular', color: c.text },
    toggleTextActive: { color: '#fff' },
    timeRow:          { flexDirection: 'row', gap: 12 },
    timeField:        { flex: 1 },
    cancel:           { textAlign: 'center', color: c.subtext, fontSize: 15, padding: 16, marginTop: 8, fontFamily: 'Sora_400Regular' },
  });
}

export default function NewLogScreen() {
  const router = useRouter();
  const { habitId } = useLocalSearchParams<{ habitId: string }>();

  const { habits } = useHabitsContext();
  const { addLog } = useLogs();
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  //This defaults the date field to today's date in DD/MM/YYYY format
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

  //This looks up the currently selected habit from the habits list
  const habit = habits.find(h => h.id === selectedHabitId);

  const habitOptions = habits.map(h => ({ label: h.name, value: String(h.id) }));

  //This validates the form, converts the value to the correct format, and saves the log entry
  async function handleSave() {
    if (!selectedHabitId) {
      Alert.alert('Error', 'Please select a habit.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Error', 'Please enter a date.');
      return;
    }
    if (!isValidDisplayDate(date)) {
      Alert.alert('Error', 'Please enter a valid date in DD/MM/YYYY format.');
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

        {/*This shows a boolean toggle, hours/mins fields, or a single value field depending on the habit type*/}
        {habit?.metricType === 'boolean' ? (
          <View style={styles.boolRow}>
            <Text style={styles.label}>Done?</Text>
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, boolValue && styles.toggleActive]}
                onPress={() => setBoolValue(true)}
                accessibilityRole="radio"
                accessibilityState={{ checked: boolValue === true }}
                accessibilityLabel="Mark as done"
              >
                <Text style={[styles.toggleText, boolValue && styles.toggleTextActive]}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !boolValue && styles.toggleActive]}
                onPress={() => setBoolValue(false)}
                accessibilityRole="radio"
                accessibilityState={{ checked: boolValue === false }}
                accessibilityLabel="Mark as not done"
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