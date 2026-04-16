import { AppColours } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'edit' | 'danger';
  disabled?: boolean;
};

export default function PrimaryButton({ title, onPress, variant = 'primary', disabled = false }: Props) {
  const bg = variant === 'edit'
    ? AppColours.edit
    : variant === 'danger'
    ? AppColours.danger
    : AppColours.primary;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg }, disabled && styles.disabled]}
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

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
