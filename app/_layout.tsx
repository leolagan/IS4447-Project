import { seedIfEmpty } from '@/db/seed';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
