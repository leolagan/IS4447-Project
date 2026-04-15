import ColourPicker from '@/components/ui/ColourPicker';
import FormField from '@/components/ui/FormField';
import { AppColours } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const DEFAULT_COLOUR = '#FF6B6B';

export default function NewCategoryScreen() {
  const router = useRouter();
  const { addCategory } = useCategories();

  const [name, setName] = useState('');
  const [colour, setColour] = useState(DEFAULT_COLOUR);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }
    await addCategory(name.trim(), colour);
    router.back();
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>New Category</Text>

        <FormField
          label="Category Name"
          placeholder="e.g. Fitness"
          value={name}
          onChangeText={setName}
        />

        <ColourPicker selectedColour={colour} onSelect={setColour} />

        <View style={styles.preview}>
          <View style={[styles.previewSwatch, { backgroundColor: colour }]} />
          <Text style={styles.previewName}>{name || 'Preview'}</Text>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Category</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: AppColours.background, padding: 16, paddingTop: 60 },
  title:        { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: AppColours.text },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColours.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  previewSwatch: { width: 28, height: 28, borderRadius: 14 },
  previewName:   { fontSize: 16, fontWeight: '600', color: AppColours.text },
  saveBtn:       { backgroundColor: AppColours.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:   { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel:        { textAlign: 'center', color: AppColours.subtext, fontSize: 16, padding: 16 },
});
