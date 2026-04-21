jest.mock('expo-sqlite', () => {
  const Database = require('better-sqlite3');
  const sqlite = new Database(':memory:');

  return {
    openDatabaseSync: () => ({
      execSync(sql: string) {
        sqlite.exec(sql);
      },
      prepareSync(sql: string) {
        const stmt    = sqlite.prepare(sql);
        return {
          executeSync(params: unknown[] = []) {
            let cached: ReturnType<typeof stmt.run> | null = null;
            const execDml = () => { if (!cached) cached = stmt.run(params); return cached!; };
            return {
              getAllSync:    () => stmt.all(params),
              getFirstSync:  () => stmt.get(params) ?? null,
              get changes()        { return execDml().changes; },
              get lastInsertRowId() { return Number(execDml().lastInsertRowid); },
            };
          },
          executeForRawResultSync(params: unknown[] = []) {
            const stmtRaw = sqlite.prepare(sql).raw(true);
            return { getAllSync: () => stmtRaw.all(params) };
          },
        };
      },
    }),
  };
});

import { db } from '@/db/client';
import { seedIfEmpty } from '@/db/seed';
import { categories, habitLogs, habits, targets } from '@/db/schema';

describe('seedIfEmpty', () => {
  let countAfterFirstSeed: { habits: number; categories: number; targets: number; logs: number };

  it('populates habits, categories, targets and habitLogs with data', async () => {
    await seedIfEmpty();

    const habitRows    = await db.select().from(habits);
    const categoryRows = await db.select().from(categories);
    const targetRows   = await db.select().from(targets);
    const logRows      = await db.select().from(habitLogs);

    expect(habitRows.length).toBeGreaterThan(0);
    expect(categoryRows.length).toBeGreaterThan(0);
    expect(targetRows.length).toBeGreaterThan(0);
    expect(logRows.length).toBeGreaterThan(0);

    countAfterFirstSeed = {
      habits:     habitRows.length,
      categories: categoryRows.length,
      targets:    targetRows.length,
      logs:       logRows.length,
    };
  });

  it('does not create duplicate rows when called a second time', async () => {
    await seedIfEmpty();

    const habitRows    = await db.select().from(habits);
    const categoryRows = await db.select().from(categories);
    const targetRows   = await db.select().from(targets);
    const logRows      = await db.select().from(habitLogs);

    expect(habitRows.length).toBe(countAfterFirstSeed.habits);
    expect(categoryRows.length).toBe(countAfterFirstSeed.categories);
    expect(targetRows.length).toBe(countAfterFirstSeed.targets);
    expect(logRows.length).toBe(countAfterFirstSeed.logs);
  });
});
