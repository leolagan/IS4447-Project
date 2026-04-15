import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
  editable?: boolean;
};

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  keyboardType,
  editable = true,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, !editable && styles.disabled]}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        editable={editable}
      />
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
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabled: {
    backgroundColor: '#F8F9FA',
    borderColor: '#DEE2E6',
    color: '#868E96',
  },
});
