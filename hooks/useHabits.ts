import { useAuth } from '@/context/AuthContext';
import { db } from '@/db/client';
import { habits } from '@/db/schema';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useCallback, useState } from 'react';

export function useHabits() {
  const { user } = useAuth();
  const [data, setData] = useState<typeof habits.$inferSelect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await db.select().from(habits).where(eq(habits.userId, user.id));
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load habits.');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [user?.id])
  );

  async function addHabit(name: string, metricType: string, unit: string, categoryId: number) {
    if (!user) return;
    await db.insert(habits).values({ userId: user.id, name, metricType, unit, categoryId });
    load();
  }

  async function updateHabit(id: number, name: string, metricType: string, unit: string, categoryId: number) {
    await db.update(habits).set({ name, metricType, unit, categoryId }).where(eq(habits.id, id));
    load();
  }

  async function deleteHabit(id: number) {
    await db.delete(habits).where(eq(habits.id, id));
    load();
  }

  return { habits: data, addHabit, updateHabit, deleteHabit, reload: load, isLoading, error };
}
