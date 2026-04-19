import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Option = {
  label: string;
  value: string;
  colour?: string;
};

type Props = {
  label: string;
  options: Option[];
  selected: string | null;
  placeholder?: string;
  onSelect: (value: string) => void;
};

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', fontFamily: 'Sora_600SemiBold', marginBottom: 8, color: c.text },
    selector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 14,
      backgroundColor: c.card,
    },
    selectorText: { fontSize: 15, color: c.text, fontFamily: 'Sora_400Regular' },
    placeholder:  { color: c.subtext },
    arrow:        { fontSize: 16, color: c.subtext },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 4,
      borderTopColor: c.primary,
      paddingTop: 16,
      paddingBottom: 40,
      maxHeight: '60%',
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: '700',
      fontFamily: 'Sora_700Bold',
      color: c.text,
      textAlign: 'center',
      paddingHorizontal: 20,
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    optionSelected:     { backgroundColor: c.primaryLight },
    dot:                { width: 16, height: 16, borderRadius: 8 },
    optionText:         { flex: 1, fontSize: 16, color: c.text, fontFamily: 'Sora_400Regular' },
    optionTextSelected: { color: c.primary, fontWeight: '600', fontFamily: 'Sora_600SemiBold' },
    tick:               { fontSize: 16, color: c.primary, fontWeight: '700' },
  });
}

export default function DropdownPicker({ label, options, selected, placeholder = 'Select...', onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);
  const selectedLabel = options.find(o => o.value === selected)?.label ?? null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={[styles.selectorText, !selectedLabel && styles.placeholder]}>
          {selectedLabel ?? placeholder}
        </Text>
        <Text style={styles.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={o => o.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === selected && styles.optionSelected]}
                  onPress={() => { onSelect(item.value); setOpen(false); }}
                >
                  {item.colour && <View style={[styles.dot, { backgroundColor: item.colour }]} />}
                  <Text style={[styles.optionText, item.value === selected && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {item.value === selected && <Text style={styles.tick}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
