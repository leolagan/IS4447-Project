import { AuthProvider } from '@/context/AuthContext';
import { seedIfEmpty } from '@/db/seed';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
