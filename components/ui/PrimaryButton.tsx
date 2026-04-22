//This imports the theme context needed to colour the button
import { useTheme } from '@/context/ThemeContext';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'edit' | 'danger';
  disabled?: boolean;
};

export default function PrimaryButton({ title, onPress, variant = 'primary', disabled = false }: Props) {
  const { colours } = useTheme();

  //This picks the background colour based on the variant prop
  const bg = variant === 'edit'
    ? colours.edit
    : variant === 'danger'
    ? colours.danger
    : colours.primary;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, shadowColor: bg }, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

//This is the static stylesheet for the button
const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});