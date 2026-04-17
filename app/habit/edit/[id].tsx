import DropdownPicker from '@/components/ui/DropdownPicker';
import FormField from '@/components/ui/FormField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const UNIT_OPTIONS = [
  { label: 'km', value: 'km' },
  { label: 'grams', value: 'grams' },
  { label: 'hrs/mins', value: 'hrs/mins' },
  { label: 'calories', value: 'calories' },
];

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    scroll:           { flex: 1, backgroundColor: c.background },
    container:        { padding: 16, paddingTop: 60, paddingBottom: 40 },
    title:            { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: c.text },
    label:            { fontSize: 14, fontWeight: '600', marginBottom: 8, color: c.text },
    toggle:           { flexDirection: 'row', marginBottom: 16, borderRadius: 8, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
    toggleBtn:        { flex: 1, padding: 12, alignItems: 'center', backgroundColor: c.card },
    toggleActive:     { backgroundColor: c.primary },
    toggleText:       { fontSize: 14, fontWeight: '500', color: c.text },
    toggleTextActive: { color: '#fff' },
    cancel:           { textAlign: 'center', color: c.subtext, fontSize: 16, padding: 16 },
  });
}

export default function EditHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, updateHabit } = useHabits();
  const { categories } = useCategories();
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<string | null>(null);
  const [metricType, setMetricType] = useState<'count' | 'boolean'>('count');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const habit = habits.find(h => h.id === Number(id));
    if (habit) {
      setName(habit.name);
      setUnit(habit.unit);
      setMetricType(habit.metricType as 'count' | 'boolean');
      setCategoryId(habit.categoryId);
    }
  }, [habits, id]);

  const categoryOptions = categories.map(c => ({
    label: c.name,
    value: String(c.id),
    colour: c.color,
  }));

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }
    await updateHabit(Number(id), name.trim(), metricType, unit ?? 'times', categoryId);
    router.back();
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Edit Habit</Text>

      <FormField
        label="Habit Name"
        placeholder="e.g. Morning Run"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, metricType === 'count' && styles.toggleActive]}
          onPress={() => setMetricType('count')}
        >
          <Text style={[styles.toggleText, metricType === 'count' && styles.toggleTextActive]}>
            Count
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, metricType === 'boolean' && styles.toggleActive]}
          onPress={() => setMetricType('boolean')}
        >
          <Text style={[styles.toggleText, metricType === 'boolean' && styles.toggleTextActive]}>
            Done / Not Done
          </Text>
        </TouchableOpacity>
      </View>

      {metricType === 'count' && (
        <DropdownPicker
          label="Unit"
          options={UNIT_OPTIONS}
          selected={unit}
          placeholder="Select a unit..."
          onSelect={setUnit}
        />
      )}

      <DropdownPicker
        label="Category"
        options={categoryOptions}
        selected={categoryId !== null ? String(categoryId) : null}
        placeholder="Select a category..."
        onSelect={value => setCategoryId(Number(value))}
      />

      <PrimaryButton title="Save Changes" onPress={handleSave} variant="edit" />

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
