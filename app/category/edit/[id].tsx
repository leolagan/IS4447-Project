import ColourPicker from '@/components/ui/ColourPicker';
import FormField from '@/components/ui/FormField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: c.background, padding: 16, paddingTop: 56 },
    title:        { fontSize: 30, fontWeight: 'bold', fontFamily: 'Sora_700Bold', marginBottom: 28, color: c.text },
    preview: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    previewSwatch: { width: 32, height: 32, borderRadius: 16 },
    previewName:   { fontSize: 16, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.text },
    cancel:        { textAlign: 'center', color: c.subtext, fontSize: 15, padding: 16, marginTop: 8, fontFamily: 'Sora_400Regular' },
  });
}

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, updateCategory } = useCategories();
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const [name, setName] = useState('');
  const [colour, setColour] = useState('#10C9A0');
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

        <PrimaryButton title="Save Changes" onPress={handleSave} variant="primary" />

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
