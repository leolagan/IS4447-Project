import { AuthProvider } from '@/context/AuthContext';
import { HabitsProvider } from '@/context/HabitsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { seedIfEmpty } from '@/db/seed';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    seedIfEmpty();
  }, []);

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
