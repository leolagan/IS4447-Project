import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      padding: 24,
      paddingTop: 60,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: c.text,
      marginBottom: 24,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: c.border,
    },
    label: {
      fontSize: 13,
      color: c.subtext,
      marginBottom: 4,
    },
    username: {
      fontSize: 20,
      fontWeight: '600',
      color: c.text,
    },
    themeLabel:       { fontSize: 14, fontWeight: '600', marginBottom: 8, color: c.text },
    toggle:           { flexDirection: 'row', marginBottom: 32, borderRadius: 8, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
    toggleBtn:        { flex: 1, padding: 12, alignItems: 'center', backgroundColor: c.card },
    toggleActive:     { backgroundColor: c.primary },
    toggleText:       { fontSize: 14, fontWeight: '500', color: c.text },
    toggleTextActive: { color: '#fff' },
  });
}

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const { isDark, toggleTheme, colours } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  function handleLogout() {
    setUser(null);
    router.replace('/(auth)/login');
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (user) {
              await db.delete(users).where(eq(users.id, user.id));
            }
            setUser(null);
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Logged in as</Text>
        <Text style={styles.username}>{user?.username}</Text>
      </View>

      <Text style={styles.themeLabel}>Theme</Text>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, !isDark && styles.toggleActive]}
          onPress={() => isDark && toggleTheme()}
          accessibilityRole="button"
          accessibilityLabel="Light mode"
        >
          <Text style={[styles.toggleText, !isDark && styles.toggleTextActive]}>Light</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, isDark && styles.toggleActive]}
          onPress={() => !isDark && toggleTheme()}
          accessibilityRole="button"
          accessibilityLabel="Dark mode"
        >
          <Text style={[styles.toggleText, isDark && styles.toggleTextActive]}>Dark</Text>
        </TouchableOpacity>
      </View>

      <PrimaryButton title="Log Out" onPress={handleLogout} variant="edit" />
      <PrimaryButton title="Delete Account" onPress={handleDeleteAccount} variant="danger" />
    </View>
  );
}
