//This imports all the hooks and database utilities needed to manage habit logs
import { useAuth } from '@/context/AuthContext';
import { db } from '@/db/client';
import { habitLogs } from '@/db/schema';
import { useFocusEffect } from '@react-navigation/native';
import { and, eq } from 'drizzle-orm';
import { useCallback, useState } from 'react';

export function useLogs(habitId?: number) {
  const { user } = useAuth();
  const [data, setData] = useState<typeof habitLogs.$inferSelect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //This fetches logs for the current user, optionally filtered to a single habit
  async function load() {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = habitId
        ? await db.select().from(habitLogs).where(and(eq(habitLogs.userId, user.id), eq(habitLogs.habitId, habitId)))
        : await db.select().from(habitLogs).where(eq(habitLogs.userId, user.id));
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load logs.');
    } finally {
      setIsLoading(false);
    }
  }

  //This reloads logs whenever the screen comes into focus or the user or habit changes
  useFocusEffect(
    useCallback(() => {
      load();
    }, [user?.id, habitId])
  );

  //This inserts a new log entry and reloads the list
  async function addLog(habitId: number, date: string, value: number, notes: string) {
    if (!user) return;
    await db.insert(habitLogs).values({ userId: user.id, habitId, date, value, notes });
    load();
  }

  //This updates an existing log's date, value, and notes then reloads
  async function updateLog(id: number, date: string, value: number, notes: string) {
    await db.update(habitLogs).set({ date, value, notes }).where(eq(habitLogs.id, id));
    load();
  }

  //This deletes a log entry by ID and reloads the list
  async function deleteLog(id: number) {
    await db.delete(habitLogs).where(eq(habitLogs.id, id));
    load();
  }

  return { logs: data, addLog, updateLog, deleteLog, reload: load, isLoading, error };
}