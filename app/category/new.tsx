//This imports all the components and contexts needed for the new category screen
import ColourPicker from '@/components/ui/ColourPicker';
import FormField from '@/components/ui/FormField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

//This is the default colour used when no colour has been selected yet
const DEFAULT_COLOUR = '#10C9A0';

//This lists the available icon options the user can pick for their category
const ICONS = [
  'heart-outline', 'fitness-outline', 'book-outline', 'moon-outline', 'nutrition-outline',
  'walk-outline', 'barbell-outline', 'water-outline', 'bulb-outline', 'musical-notes-outline',
  'leaf-outline', 'star-outline', 'bicycle-outline', 'bed-outline', 'cafe-outline',
  'flash-outline', 'happy-outline', 'people-outline', 'school-outline', 'trophy-outline',
] as const;

type IconName = typeof ICONS[number];

//This generates a stylesheet from the current theme colours
function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    scroll:         { flex: 1, backgroundColor: c.background },
    container:      { padding: 16, paddingTop: 56, paddingBottom: 40 },
    title:          { fontSize: 30, fontWeight: 'bold', fontFamily: 'Sora_700Bold', marginBottom: 28, color: c.text },
    label:          { fontSize: 14, fontWeight: '600', fontFamily: 'Sora_600SemiBold', marginBottom: 8, color: c.text },
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
    previewSwatch:      { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    previewName:        { fontSize: 16, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.text },
    iconGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    iconOption:         { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
    iconOptionSelected: { backgroundColor: c.primaryLight, borderColor: c.primary, borderWidth: 2 },
    cancel:             { textAlign: 'center', color: c.subtext, fontSize: 15, padding: 16, marginTop: 8, fontFamily: 'Sora_400Regular' },
  });
}

export default function NewCategoryScreen() {
  const router = useRouter();
  const { addCategory } = useCategories();
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const [name, setName] = useState('');
  const [colour, setColour] = useState(DEFAULT_COLOUR);
  const [selectedIcon, setSelectedIcon] = useState<IconName | null>(null);

  //This validates the form and creates the new category before navigating back
  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }
    await addCategory(name.trim(), colour, selectedIcon);
    router.back();
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>New Category</Text>

      <FormField
        label="Category Name"
        placeholder="e.g. Fitness"
        value={name}
        onChangeText={setName}
      />

      <ColourPicker selectedColour={colour} onSelect={setColour} />

      {/*This is the icon picker grid*/}
      <Text style={styles.label}>Icon</Text>
      <View style={styles.iconGrid}>
        {ICONS.map(icon => (
          <TouchableOpacity
            key={icon}
            style={[styles.iconOption, selectedIcon === icon && styles.iconOptionSelected]}
            onPress={() => setSelectedIcon(selectedIcon === icon ? null : icon)}
            accessibilityRole="button"
            accessibilityLabel={icon}
            accessibilityState={{ selected: selectedIcon === icon }}
          >
            <Ionicons
              name={icon}
              size={22}
              color={selectedIcon === icon ? colours.primary : colours.subtext}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/*This shows a live preview of the category with the selected colour and icon*/}
      <View style={styles.preview}>
        <View style={[styles.previewSwatch, { backgroundColor: colour }]}>
          {selectedIcon && (
            <Ionicons name={selectedIcon} size={16} color="#fff" />
          )}
        </View>
        <Text style={styles.previewName}>{name || 'Preview'}</Text>
      </View>

      <PrimaryButton title="Save Category" onPress={handleSave} />

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}