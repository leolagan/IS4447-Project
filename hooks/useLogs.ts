import { db } from '@/db/client';
import { habitLogs } from '@/db/schema';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useCallback, useState } from 'react';

export function useLogs(habitId?: number) {
  const [data, setData] = useState<typeof habitLogs.$inferSelect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      if (habitId) {
        const result = await db.select().from(habitLogs).where(eq(habitLogs.habitId, habitId));
        setData(result);
      } else {
        const result = await db.select().from(habitLogs);
        setData(result);
      }
      setError(null);
    } catch {
      setError('Failed to load logs.');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [habitId])
  );

  async function addLog(habitId: number, date: string, value: number, notes: string) {
    await db.insert(habitLogs).values({ habitId, date, value, notes });
    load();
  }

  async function updateLog(id: number, date: string, value: number, notes: string) {
    await db.update(habitLogs).set({ date, value, notes }).where(eq(habitLogs.id, id));
    load();
  }

  async function deleteLog(id: number) {
    await db.delete(habitLogs).where(eq(habitLogs.id, id));
    load();
  }

  return { logs: data, addLog, updateLog, deleteLog, reload: load, isLoading, error };
}
