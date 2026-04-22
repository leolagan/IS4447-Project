//This imports all the providers, fonts and seed function needed to bootstrap the app
import { AuthProvider } from '@/context/AuthContext';
import { HabitsProvider } from '@/context/HabitsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { seedIfEmpty } from '@/db/seed';
import { Sora_400Regular, Sora_600SemiBold, Sora_700Bold, useFonts } from '@expo-google-fonts/sora';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  //This loads the Sora font family before rendering anything
  const [fontsLoaded] = useFonts({ Sora_400Regular, Sora_600SemiBold, Sora_700Bold });

  //This runs the seed function once on app launch to populate demo data if the database is empty
  useEffect(() => {
    seedIfEmpty();
  }, []);

  //This holds the app from rendering until fonts are ready
  if (!fontsLoaded) return null;

  return (
    //This wraps the whole app in context providers for auth, theme, and habits
    <AuthProvider>
      <ThemeProvider>
        <HabitsProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </HabitsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}