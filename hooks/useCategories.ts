import { db } from '@/db/client';
import { categories, habits } from '@/db/schema';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useCallback, useState } from 'react';

export function useCategories() {
  const [data, setData] = useState<typeof categories.$inferSelect[]>([]);

  async function load() {
    const result = await db.select().from(categories);
    setData(result);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function addCategory(name: string, colour: string) {
    await db.insert(categories).values({ name, colour });
    load();
  }

  async function updateCategory(id: number, name: string, colour: string) {
    await db.update(categories).set({ name, colour }).where(eq(categories.id, id));
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

  return { categories: data, addCategory, updateCategory, deleteCategory, reload: load };
}
