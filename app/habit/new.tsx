import DropdownPicker from '@/components/ui/DropdownPicker';
import FormField from '@/components/ui/FormField';
import { AppColours } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const UNIT_OPTIONS = [
  { label: 'km', value: 'km' },
  { label: 'grams', value: 'grams' },
  { label: 'minutes', value: 'minutes' },
  { label: 'hrs/mins', value: 'hrs/mins' },
  { label: 'steps', value: 'steps' },
  { label: 'calories', value: 'calories' },
];

export default function NewHabitScreen() {
  const router = useRouter();
  const { addHabit } = useHabits();
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<string | null>(null);
  const [metricType, setMetricType] = useState<'count' | 'boolean'>('count');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const categoryOptions = categories.map(c => ({
    label: c.name,
    value: String(c.id),
    colour: c.colour,
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
    await addHabit(name.trim(), metricType, unit ?? 'times', categoryId);
    router.back();
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>New Habit</Text>

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

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Habit</Text>
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
  saveBtn:          { backgroundColor: AppColours.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:      { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel:           { textAlign: 'center', color: AppColours.subtext, fontSize: 16, padding: 16 },
});
