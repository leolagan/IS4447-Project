import FormField from '@/components/ui/FormField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    flex:       { flex: 1, backgroundColor: c.background },
    scroll:     { flex: 1 },
    container:  { padding: 24, paddingTop: 80, paddingBottom: 40 },
    header:     { alignItems: 'center', marginBottom: 32 },
    logo:       { width: 64, height: 64, borderRadius: 16, marginBottom: 8 },
    brand:      { fontSize: 22, fontWeight: 'bold', color: c.primary },
    title:      { fontSize: 28, fontWeight: 'bold', color: c.text, marginBottom: 4 },
    subtitle:   { fontSize: 15, color: c.subtext, marginBottom: 28 },
    error:      { color: c.danger, fontSize: 14, marginBottom: 12 },
    switchRow:  { alignItems: 'center', marginTop: 20 },
    switchText: { fontSize: 14, color: c.subtext },
    switchLink: { color: c.primary, fontWeight: '600' },
  });
}

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);

    if (!username.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const existing = await db.select().from(users).where(eq(users.username, username.trim()));
    if (existing.length > 0) {
      setError('That username is already taken.');
      return;
    }

    const result = await db
      .insert(users)
      .values({ username: username.trim(), password })
      .returning();

    const newUser = result[0];
    setUser({ id: newUser.id, username: newUser.username });
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            accessibilityLabel="HabitFlow logo"
          />
          <Text style={styles.brand}>HabitFlow</Text>
        </View>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start tracking your habits</Text>

        <FormField
          label="Username"
          placeholder="Choose a username"
          value={username}
          onChangeText={setUsername}
        />

        <FormField
          label="Password"
          placeholder="Choose a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <FormField
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton title="Create Account" onPress={handleRegister} />

        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => router.replace('/(auth)/login')}
          accessibilityRole="link"
          accessibilityLabel="Go to Login"
        >
          <Text style={styles.switchText}>
            Already have an account?{' '}
            <Text style={styles.switchLink}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
