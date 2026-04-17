import { useAuth } from '@/context/AuthContext';
import { db } from '@/db/client';
import { categories, habits } from '@/db/schema';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useCallback, useState } from 'react';

export function useCategories() {
  const { user } = useAuth();
  const [data, setData] = useState<typeof categories.$inferSelect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await db.select().from(categories).where(eq(categories.userId, user.id));
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [user?.id])
  );

  async function addCategory(name: string, color: string) {
    if (!user) return;
    await db.insert(categories).values({ userId: user.id, name, color });
    load();
  }

  async function updateCategory(id: number, name: string, color: string) {
    await db.update(categories).set({ name, color }).where(eq(categories.id, id));
    load();
  }

  async function deleteCategory(id: number): Promise<string | null> {
    const linked = await db.select().from(habits).where(eq(habits.categoryId, id));
    if (linked.length > 0) {
      return `Cannot delete — ${linked.length} habit${linked.length > 1 ? 's' : ''} use this category.`;
    }
    await db.delete(categories).where(eq(categories.id, id));
    load();
    return null;
  }

  return { categories: data, addCategory, updateCategory, deleteCategory, reload: load, isLoading, error };
}
