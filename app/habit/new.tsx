//This imports all the components and contexts needed for the new habit screen
import DropdownPicker from '@/components/ui/DropdownPicker';
import FormField from '@/components/ui/FormField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useHabitsContext } from '@/context/HabitsContext';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

//This lists the preset unit options available in the unit dropdown
const UNIT_OPTIONS = [
  { label: 'km', value: 'km' },
  { label: 'hours/mins', value: 'hrs/mins' },
  { label: 'grams', value: 'grams' },
  { label: '+ Custom unit…', value: '__custom__' },
];

//This generates a stylesheet from the current theme colours
function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    scroll:           { flex: 1, backgroundColor: c.background },
    container:        { padding: 16, paddingTop: 56, paddingBottom: 40 },
    title:            { fontSize: 30, fontWeight: 'bold', fontFamily: 'Sora_700Bold', marginBottom: 28, color: c.text },
    label:            { fontSize: 14, fontWeight: '600', fontFamily: 'Sora_600SemiBold', marginBottom: 8, color: c.text },
    toggle:           { flexDirection: 'row', marginBottom: 16, borderRadius: 12, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
    toggleBtn:        { flex: 1, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', backgroundColor: c.card },
    toggleActive:     { backgroundColor: c.primary },
    toggleText:       { fontSize: 14, fontWeight: '500', fontFamily: 'Sora_400Regular', color: c.text },
    toggleTextActive: { color: '#fff' },
    cancel:           { textAlign: 'center', color: c.subtext, fontSize: 15, padding: 16, marginTop: 8, fontFamily: 'Sora_400Regular' },
    usePreset:        { fontSize: 13, color: c.primary, fontFamily: 'Sora_400Regular', marginTop: 4, marginBottom: 16 },
  });
}

export default function NewHabitScreen() {
  const router = useRouter();
  const { addHabit } = useHabitsContext();
  const { categories } = useCategories();
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<string | null>(null);
  const [customUnit, setCustomUnit] = useState('');
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [metricType, setMetricType] = useState<'count' | 'boolean'>('count');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  //This maps categories to the format the DropdownPicker expects
  const categoryOptions = categories.map(c => ({
    label: c.name,
    value: String(c.id),
    colour: c.color,
  }));

  //This validates the form and creates the new habit before navigating back
  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }
    const finalUnit = isCustomUnit ? customUnit.trim() : (unit ?? 'times');
    if (metricType === 'count' && !finalUnit) {
      Alert.alert('Error', 'Please enter a unit name.');
      return;
    }
    await addHabit(name.trim(), metricType, finalUnit || 'times', categoryId);
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

      {/*This is the count vs done/not done metric type toggle*/}
      <Text style={styles.label}>Type</Text>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, metricType === 'count' && styles.toggleActive]}
          onPress={() => setMetricType('count')}
          accessibilityRole="radio"
          accessibilityState={{ checked: metricType === 'count' }}
          accessibilityLabel="Count metric type"
        >
          <Text style={[styles.toggleText, metricType === 'count' && styles.toggleTextActive]}>
            Count
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, metricType === 'boolean' && styles.toggleActive]}
          onPress={() => setMetricType('boolean')}
          accessibilityRole="radio"
          accessibilityState={{ checked: metricType === 'boolean' }}
          accessibilityLabel="Done or Not Done metric type"
        >
          <Text style={[styles.toggleText, metricType === 'boolean' && styles.toggleTextActive]}>
            Done / Not Done
          </Text>
        </TouchableOpacity>
      </View>

      {/*This shows a custom text field or a preset dropdown depending on what the user selected*/}
      {metricType === 'count' && (
        isCustomUnit ? (
          <>
            <FormField
              label="Custom Unit"
              placeholder="e.g. push-ups, glasses, sessions…"
              value={customUnit}
              onChangeText={setCustomUnit}
            />
            <TouchableOpacity onPress={() => { setIsCustomUnit(false); setCustomUnit(''); }}>
              <Text style={styles.usePreset}>Use a preset unit instead</Text>
            </TouchableOpacity>
          </>
        ) : (
          <DropdownPicker
            label="Unit"
            options={UNIT_OPTIONS}
            selected={unit}
            placeholder="Select a unit..."
            onSelect={v => {
              if (v === '__custom__') {
                setIsCustomUnit(true);
                setUnit(null);
              } else {
                setUnit(v);
              }
            }}
          />
        )
      )}

      {/*This lets the user assign the habit to one of their categories*/}
      <DropdownPicker
        label="Category"
        options={categoryOptions}
        selected={categoryId !== null ? String(categoryId) : null}
        placeholder="Select a category..."
        onSelect={value => setCategoryId(Number(value))}
      />

      <PrimaryButton title="Save Habit" onPress={handleSave} />

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}