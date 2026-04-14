import { AppColours } from '@/constants/theme';
import { useState } from 'react';
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

export default function DropdownPicker({ label, options, selected, placeholder = 'Select...', onSelect }: Props) {
  const [open, setOpen] = useState(false);
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

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectorText: { fontSize: 16, color: AppColours.text },
  placeholder:  { color: '#aaa' },
  arrow:        { fontSize: 16, color: AppColours.subtext },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColours.text,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColours.border,
  },
  optionSelected:     { backgroundColor: AppColours.primaryLight },
  dot:                { width: 16, height: 16, borderRadius: 8 },
  optionText:         { flex: 1, fontSize: 16, color: AppColours.text },
  optionTextSelected: { color: AppColours.primary, fontWeight: '600' },
  tick:               { fontSize: 16, color: AppColours.primary, fontWeight: '700' },
});
