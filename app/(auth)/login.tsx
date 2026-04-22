//This imports all the components and contexts needed for the login screen
import FormField from '@/components/ui/FormField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { AppColours } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

//This generates a stylesheet from the current theme colours
function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    flex:       { flex: 1, backgroundColor: c.background },
    scroll:     { flex: 1 },
    container:  { padding: 24, paddingTop: 96, paddingBottom: 40 },
    header:     { alignItems: 'center', marginBottom: 32 },
    logo:       { width: 72, height: 72, borderRadius: 20, marginBottom: 10 },
    brand:      { fontSize: 13, fontWeight: 'bold', color: c.primary, letterSpacing: 2, textTransform: 'uppercase' },
    title:      { fontSize: 30, fontWeight: 'bold', fontFamily: 'Sora_700Bold', color: c.text, marginBottom: 6 },
    subtitle:   { fontSize: 15, color: c.subtext, marginBottom: 32 },
    divider:    { height: 1, backgroundColor: c.border, marginBottom: 24 },
    error:      { color: c.danger, fontSize: 14, marginBottom: 12 },
    switchRow:  { alignItems: 'center', marginTop: 28 },
    switchText: { fontSize: 14, color: c.subtext, fontFamily: 'Sora_400Regular' },
    switchLink: { color: c.primary, fontWeight: '600', fontFamily: 'Sora_600SemiBold' },
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

  //This looks up the user by username, hashes the entered password and compares it against the stored hash
  async function handleLogin() {
    setError(null);
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    const result = await db.select().from(users).where(eq(users.username, username.trim()));
    const user = result[0];

    const hashedPassword = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);

    if (!user || user.password !== hashedPassword) {
      setError('Incorrect username or password.');
      return;
    }

    //This stores the logged in user in context and sends them to the main app
    setUser({ id: user.id, username: user.username });
    router.replace('/(tabs)');
  }

  return (
    //This shifts the layout up on iOS when the keyboard appears
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/*This shows the logo and app name*/}
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
        <View style={styles.divider} />

        {/*This renders the username and password inputs*/}
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

        {/*This shows a validation or auth error if one exists*/}
        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton title="Log In" onPress={handleLogin} />

        {/*This links to the register screen for new users*/}
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