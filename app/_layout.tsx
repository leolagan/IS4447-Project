import { AuthProvider } from '@/context/AuthContext';
import { HabitsProvider } from '@/context/HabitsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { seedIfEmpty } from '@/db/seed';
import { Sora_400Regular, Sora_600SemiBold, Sora_700Bold, useFonts } from '@expo-google-fonts/sora';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Sora_400Regular, Sora_600SemiBold, Sora_700Bold });

  useEffect(() => {
    seedIfEmpty();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider>
        <HabitsProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </HabitsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
