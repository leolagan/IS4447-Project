import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
  editable?: boolean;
  secureTextEntry?: boolean;
};

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'Sora_600SemiBold',
      marginBottom: 8,
      color: c.text,
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      fontFamily: 'Sora_400Regular',
      lineHeight: 22,
      backgroundColor: c.card,
      color: c.text,
    },
    multiline: {
      height: 100,
      textAlignVertical: 'top',
    },
    disabled: {
      backgroundColor: c.background,
      borderColor: c.border,
      color: c.subtext,
    },
  });
}

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  keyboardType,
  editable = true,
  secureTextEntry = false,
}: Props) {
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, !editable && styles.disabled]}
        placeholder={placeholder}
        placeholderTextColor={colours.subtext}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        editable={editable}
        secureTextEntry={secureTextEntry}
        accessibilityLabel={label}
      />
    </View>
  );
}
