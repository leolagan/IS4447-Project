//This imports all the components and contexts needed for the colour picker
import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

//This lists the 12 preset colours available for selection
const PRESET_COLOURS = [
  '#FF6B6B', '#FA5252', '#FF922B', '#FCC419',
  '#51CF66', '#20C997', '#339AF0', '#4DABF7',
  '#748FFC', '#845EF7', '#F06595', '#868E96',
];

type Props = {
  selectedColour: string;
  onSelect: (colour: string) => void;
};

//This generates a stylesheet from the current theme colours
function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 10,
      color: c.text,
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
      borderColor: c.text,
    },
    innerRing: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#fff',
      opacity: 0.7,
    },
  });
}

export default function ColourPicker({ selectedColour, onSelect }: Props) {
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Colour</Text>
      {/*This renders a circular swatch for each preset colour with a checkmark ring on the selected one*/}
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