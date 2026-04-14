import { AppColors } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRESET_COLORS = [
  '#FF6B6B', '#FA5252', '#FF922B', '#FCC419',
  '#51CF66', '#20C997', '#339AF0', '#4DABF7',
  '#748FFC', '#845EF7', '#F06595', '#868E96',
];

type Props = {
  selectedColor: string;
  onSelect: (color: string) => void;
};

export default function ColorPicker({ selectedColor, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Colour</Text>
      <View style={styles.grid}>
        {PRESET_COLORS.map(color => {
          const isSelected = color === selectedColor;
          return (
            <TouchableOpacity
              key={color}
              style={[
                styles.swatch,
                { backgroundColor: color },
                isSelected && styles.swatchSelected,
              ]}
              onPress={() => onSelect(color)}
              activeOpacity={0.8}
            >
              {isSelected && <View style={styles.innerRing} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: AppColors.text,
  },
  innerRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    opacity: 0.7,
  },
});
