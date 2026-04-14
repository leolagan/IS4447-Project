import { db } from '@/db/client';
import { habits } from '@/db/schema';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useCallback, useState } from 'react';

export function useHabits() {
  const [data, setData] = useState<typeof habits.$inferSelect[]>([]);

  async function load() {
    const result = await db.select().from(habits);
    setData(result);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function addHabit(name: string, metricType: string, unit: string, categoryId: number) {
    await db.insert(habits).values({ name, metricType, unit, categoryId });
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

  return { habits: data, addHabit, updateHabit, deleteHabit, reload: load };
}
