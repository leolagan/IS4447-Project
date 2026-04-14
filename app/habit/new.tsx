import CategoryPicker from '@/components/ui/CategoryPicker';
import FormField from '@/components/ui/FormField';
import { AppColors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useHabits } from '@/hooks/useHabits';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const UNIT_PRESETS = ['km', 'grams', 'steps', 'hrs/mins', 'sessions', 'calories'];

export default function NewHabitScreen() {
  const router = useRouter();
  const { addHabit } = useHabits();
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [metricType, setMetricType] = useState<'count' | 'boolean'>('count');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }
    await addHabit(name.trim(), metricType, unit.trim() || 'times', categoryId);
    router.back();
  }

  return (
    <View style={styles.container}>
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
            Yes / No
          </Text>
        </TouchableOpacity>
      </View>

      {metricType === 'count' && (
        <>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.presetRow}>
            {UNIT_PRESETS.map(preset => (
              <TouchableOpacity
                key={preset}
                style={[styles.presetChip, unit === preset && styles.presetChipActive]}
                onPress={() => setUnit(preset)}
              >
                <Text style={[styles.presetText, unit === preset && styles.presetTextActive]}>
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FormField
            label="Or type a custom unit"
            placeholder="e.g. reps, liters"
            value={unit}
            onChangeText={setUnit}
          />
        </>
      )}

      <Text style={styles.label}>Category</Text>
      <CategoryPicker
        categories={categories}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Habit</Text>
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
  label:            { fontSize: 14, fontWeight: '600', marginBottom: 8, color: AppColors.text },
  toggle:           { flexDirection: 'row', marginBottom: 16, borderRadius: 8, borderWidth: 1, borderColor: AppColors.border, overflow: 'hidden' },
  toggleBtn:        { flex: 1, padding: 12, alignItems: 'center', backgroundColor: AppColors.card },
  toggleActive:     { backgroundColor: AppColors.primary },
  toggleText:       { fontSize: 14, fontWeight: '500', color: AppColors.text },
  toggleTextActive: { color: '#fff' },
  presetRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  presetChip:       { borderWidth: 1, borderColor: AppColors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: AppColors.card },
  presetChipActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  presetText:       { fontSize: 13, color: AppColors.text },
  presetTextActive: { color: '#fff' },
  saveBtn:          { backgroundColor: AppColors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:      { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel:           { textAlign: 'center', color: AppColors.subtext, fontSize: 16, padding: 16 },
});
