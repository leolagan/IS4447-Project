import ColourPicker from '@/components/ui/ColourPicker';
import FormField from '@/components/ui/FormField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, updateCategory } = useCategories();

  const [name, setName] = useState('');
  const [colour, setColour] = useState('#1C8DB3');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded && categories.length > 0) {
      const cat = categories.find(c => c.id === Number(id));
      if (cat) {
        setName(cat.name);
        setColour(cat.color);
        setLoaded(true);
      }
    }
  }, [categories, loaded, id]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }
    await updateCategory(Number(id), name.trim(), colour);
    router.back();
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Category</Text>

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

        <PrimaryButton title="Save Changes" onPress={handleSave} variant="edit" />

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
  cancel:        { textAlign: 'center', color: AppColours.subtext, fontSize: 16, padding: 16 },
});
