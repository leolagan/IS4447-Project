import FormField from '@/components/ui/FormField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { formatDisplayDate, parseDisplayDate } from '@/utils/dateHelpers';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container:        { flex: 1, backgroundColor: c.background, padding: 16, paddingTop: 60 },
    title:            { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: c.text },
    habitBadge:       { backgroundColor: c.primaryLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 20 },
    habitBadgeText:   { color: c.primary, fontWeight: '600', fontSize: 14 },
    label:            { fontSize: 14, fontWeight: '600', marginBottom: 8, color: c.text },
    boolRow:          { marginBottom: 16 },
    toggle:           { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
    toggleBtn:        { flex: 1, padding: 12, alignItems: 'center', backgroundColor: c.card },
    toggleActive:     { backgroundColor: c.primary },
    toggleText:       { fontSize: 14, fontWeight: '500', color: c.text },
    toggleTextActive: { color: '#fff' },
    timeRow:          { flexDirection: 'row', gap: 12 },
    timeField:        { flex: 1 },
    cancel:           { textAlign: 'center', color: c.subtext, fontSize: 16, padding: 16 },
  });
}

export default function EditLogScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { habits } = useHabits();
  const { logs, updateLog } = useLogs();
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

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
      setDate(formatDisplayDate(log.date));
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

    await updateLog(Number(id), parseDisplayDate(date), finalValue, notes);
    router.back();
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Log</Text>

        {habit && (
          <View style={styles.habitBadge}>
            <Text style={styles.habitBadgeText}>{habit.name}</Text>
          </View>
        )}

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

        <PrimaryButton title="Save Changes" onPress={handleSave} />

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
