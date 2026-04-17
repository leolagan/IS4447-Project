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

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    const result = await db.select().from(users).where(eq(users.username, username.trim()));
    const user = result[0];

    if (!user || user.password !== password) {
      setError('Incorrect username or password.');
      return;
    }

    setUser({ id: user.id, username: user.username });
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

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>

        <FormField
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
        />

        <FormField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton title="Log In" onPress={handleLogin} />

        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => router.replace('/(auth)/register')}
          accessibilityRole="link"
          accessibilityLabel="Go to Register"
        >
          <Text style={styles.switchText}>
            Don't have an account?{' '}
            <Text style={styles.switchLink}>Register</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
