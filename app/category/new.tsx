import ColorPicker from '@/components/ui/ColorPicker';
import FormField from '@/components/ui/FormField';
import { AppColors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DEFAULT_COLOR = '#FF6B6B';

export default function NewCategoryScreen() {
  const router = useRouter();
  const { addCategory } = useCategories();

  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }
    await addCategory(name.trim(), color);
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Category</Text>

      <FormField
        label="Category Name"
        placeholder="e.g. Fitness"
        value={name}
        onChangeText={setName}
      />

      <ColorPicker selectedColor={color} onSelect={setColor} />

      <View style={styles.preview}>
        <View style={[styles.previewSwatch, { backgroundColor: color }]} />
        <Text style={styles.previewName}>{name || 'Preview'}</Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Category</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: AppColors.background, padding: 16, paddingTop: 60 },
  title:        { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: AppColors.text },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.card,
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
  previewName:   { fontSize: 16, fontWeight: '600', color: AppColors.text },
  saveBtn:       { backgroundColor: AppColors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:   { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel:        { textAlign: 'center', color: AppColors.subtext, fontSize: 16, padding: 16 },
});
