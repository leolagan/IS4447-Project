import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { useEffect, useState } from 'react';

export function useCategories() {
  const [data, setData] = useState<typeof categories.$inferSelect[]>([]);

  async function load() {
    const result = await db.select().from(categories);
    setData(result);
  }

  useEffect(() => {
    load();
  }, []);

  return { categories: data, reload: load };
}
