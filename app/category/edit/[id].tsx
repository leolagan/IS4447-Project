import ColorPicker from '@/components/ui/ColorPicker';
import FormField from '@/components/ui/FormField';
import { AppColors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, updateCategory } = useCategories();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#FF6B6B');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded && categories.length > 0) {
      const cat = categories.find(c => c.id === Number(id));
      if (cat) {
        setName(cat.name);
        setColor(cat.color);
        setLoaded(true);
      }
    }
  }, [categories, loaded, id]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }
    await updateCategory(Number(id), name.trim(), color);
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Category</Text>

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
        <Text style={styles.saveBtnText}>Save Changes</Text>
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
  saveBtn:       { backgroundColor: AppColors.edit, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:   { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel:        { textAlign: 'center', color: AppColors.subtext, fontSize: 16, padding: 16 },
});
