import DropdownPicker from '@/components/ui/DropdownPicker';
import FormField from '@/components/ui/FormField';
import { AppColours } from '@/constants/theme';
import { useHabits } from '@/hooks/useHabits';
import { useTargets } from '@/hooks/useTargets';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function getGoalPlaceholder(unit: string, metricType: string): string {
  if (unit === 'hrs/mins') return '';
  if (metricType === 'boolean') return 'e.g. 3';
  return `e.g. 10 ${unit}`;
}

export default function NewTargetScreen() {
  const router = useRouter();
  const { habits } = useHabits();
  const { addTarget } = useTargets();

  const [habitId, setHabitId] = useState<number | null>(null);
  const [type, setType] = useState<'weekly' | 'monthly'>('weekly');
  const [goal, setGoal] = useState('');
  const [goalHours, setGoalHours] = useState('');
  const [goalMins, setGoalMins] = useState('');
  const [direction, setDirection] = useState<'min' | 'max'>('min');

  const habitOptions = habits.map(h => ({ label: h.name, value: String(h.id) }));
  const selectedHabit = habits.find(h => h.id === habitId);
  const isTimeHabit = selectedHabit?.unit === 'hrs/mins';

  function handleHabitSelect(value: string) {
    setHabitId(Number(value));
    setGoal('');
    setGoalHours('');
    setGoalMins('');
  }

  async function handleSave() {
    if (!habitId) {
      Alert.alert('Error', 'Please select a habit.');
      return;
    }

    let goalNum: number;
    if (isTimeHabit) {
      const h = parseInt(goalHours, 10) || 0;
      const m = parseInt(goalMins, 10) || 0;
      if (!goalHours.trim() && !goalMins.trim()) {
        Alert.alert('Error', 'Please enter a goal in hours and/or minutes.');
        return;
      }
      if (isNaN(h) || isNaN(m) || h < 0 || m < 0 || m > 59) {
        Alert.alert('Error', 'Please enter valid hours and minutes (0–59).');
        return;
      }
      goalNum = h * 60 + m;
      if (goalNum === 0) {
        Alert.alert('Error', 'Goal must be greater than 0.');
        return;
      }
    } else {
      goalNum = parseInt(goal, 10);
      if (!goal.trim() || isNaN(goalNum) || goalNum <= 0) {
        Alert.alert('Error', 'Please enter a valid goal greater than 0.');
        return;
      }
    }

    await addTarget(habitId, type, goalNum, direction);
    router.back();
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>New Target</Text>

      <DropdownPicker
        label="Habit"
        options={habitOptions}
        selected={habitId !== null ? String(habitId) : null}
        placeholder="Select a habit..."
        onSelect={handleHabitSelect}
      />

      <Text style={styles.label}>Period</Text>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, type === 'weekly' && styles.toggleActive]}
          onPress={() => setType('weekly')}
        >
          <Text style={[styles.toggleText, type === 'weekly' && styles.toggleTextActive]}>
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, type === 'monthly' && styles.toggleActive]}
          onPress={() => setType('monthly')}
        >
          <Text style={[styles.toggleText, type === 'monthly' && styles.toggleTextActive]}>
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {isTimeHabit ? (
        <View>
          <Text style={styles.label}>Goal</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <FormField
                label="Hours"
                placeholder="Hours"
                value={goalHours}
                onChangeText={setGoalHours}
                keyboardType="numeric"
                editable={!!selectedHabit}
              />
            </View>
            <View style={styles.timeField}>
              <FormField
                label="Minutes"
                placeholder="Minutes"
                value={goalMins}
                onChangeText={setGoalMins}
                keyboardType="numeric"
                editable={!!selectedHabit}
              />
            </View>
          </View>
        </View>
      ) : (
        <FormField
          label="Goal"
          placeholder={
            selectedHabit
              ? getGoalPlaceholder(selectedHabit.unit, selectedHabit.metricType)
              : 'Select a habit first'
          }
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
          editable={!!selectedHabit}
        />
      )}

      <Text style={styles.label}>Direction</Text>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, direction === 'min' && styles.toggleActive]}
          onPress={() => setDirection('min')}
        >
          <Text style={[styles.toggleText, direction === 'min' && styles.toggleTextActive]}>
            At least
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, direction === 'max' && styles.toggleActive]}
          onPress={() => setDirection('max')}
        >
          <Text style={[styles.toggleText, direction === 'max' && styles.toggleTextActive]}>
            No more than
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Target</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:           { flex: 1, backgroundColor: AppColours.background },
  container:        { padding: 16, paddingTop: 60, paddingBottom: 40 },
  title:            { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: AppColours.text },
  label:            { fontSize: 14, fontWeight: '600', marginBottom: 8, color: AppColours.text },
  toggle:           { flexDirection: 'row', marginBottom: 16, borderRadius: 8, borderWidth: 1, borderColor: AppColours.border, overflow: 'hidden' },
  toggleBtn:        { flex: 1, padding: 12, alignItems: 'center', backgroundColor: AppColours.card },
  toggleActive:     { backgroundColor: AppColours.primary },
  toggleText:       { fontSize: 14, fontWeight: '500', color: AppColours.text },
  toggleTextActive: { color: '#fff' },
  timeRow:          { flexDirection: 'row', gap: 12, marginBottom: 16 },
  timeField:        { flex: 1 },
  saveBtn:          { backgroundColor: AppColours.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:      { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel:           { textAlign: 'center', color: AppColours.subtext, fontSize: 16, padding: 16 },
});
