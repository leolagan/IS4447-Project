import { AppColours } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRESET_COLOURS = [
  '#FF6B6B', '#FA5252', '#FF922B', '#FCC419',
  '#51CF66', '#20C997', '#339AF0', '#4DABF7',
  '#748FFC', '#845EF7', '#F06595', '#868E96',
];

type Props = {
  selectedColour: string;
  onSelect: (colour: string) => void;
};

export default function ColourPicker({ selectedColour, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Colour</Text>
      <View style={styles.grid}>
        {PRESET_COLOURS.map(colour => {
          const isSelected = colour === selectedColour;
          return (
            <TouchableOpacity
              key={colour}
              style={[
                styles.swatch,
                { backgroundColor: colour },
                isSelected && styles.swatchSelected,
              ]}
              onPress={() => onSelect(colour)}
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
    borderColor: AppColours.text,
  },
  innerRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    opacity: 0.7,
  },
});
