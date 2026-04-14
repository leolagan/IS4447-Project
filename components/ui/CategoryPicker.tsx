import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Category = {
  id: number;
  name: string;
  colour: string;
};

type Props = {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export default function CategoryPicker({ categories, selectedId, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {categories.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.chip,
            { borderColor: cat.colour },
            selectedId === cat.id && { backgroundColor: cat.colour },
          ]}
          onPress={() => onSelect(cat.id)}
        >
          <Text style={[styles.text, selectedId === cat.id && styles.selectedText]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
});
