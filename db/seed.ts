import { eq } from 'drizzle-orm';
import { db } from './client';
import { categories, habitLogs, habits, targets, users } from './schema';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export async function seedIfEmpty() {
  const existing = await db.select().from(users).where(eq(users.username, 'Demo'));
  if (existing.length > 0) return;

  const inserted = await db
    .insert(users)
    .values({ username: 'Demo', password: 'demo123' })
    .returning();
  const userId = inserted[0].id;

  await db.insert(categories).values([
    { userId, name: 'Fitness',   color: '#FF6B6B' },
    { userId, name: 'Nutrition', color: '#51CF66' },
    { userId, name: 'Wellness',  color: '#845EF7' },
    { userId, name: 'Recovery',  color: '#339AF0' },
  ]);

  const cats      = await db.select().from(categories).where(eq(categories.userId, userId));
  const fitness   = cats.find(c => c.name === 'Fitness')!;
  const nutrition = cats.find(c => c.name === 'Nutrition')!;
  const wellness  = cats.find(c => c.name === 'Wellness')!;
  const recovery  = cats.find(c => c.name === 'Recovery')!;

  await db.insert(habits).values([
    { userId, name: 'Run',          metricType: 'count',   unit: 'km',       categoryId: fitness.id },
    { userId, name: 'Gym Session',  metricType: 'boolean', unit: 'boolean',  categoryId: fitness.id },
    { userId, name: 'Protein Goal', metricType: 'count',   unit: 'grams',    categoryId: nutrition.id },
    { userId, name: 'Screen Time',  metricType: 'count',   unit: 'hrs/mins', categoryId: wellness.id },
    { userId, name: 'Sleep',        metricType: 'count',   unit: 'hrs/mins', categoryId: recovery.id },
    { userId, name: 'Stretching',   metricType: 'count',   unit: 'minutes',  categoryId: recovery.id },
  ]);

  const allHabits  = await db.select().from(habits).where(eq(habits.userId, userId));
  const run        = allHabits.find(h => h.name === 'Run')!;
  const gym        = allHabits.find(h => h.name === 'Gym Session')!;
  const protein    = allHabits.find(h => h.name === 'Protein Goal')!;
  const screenTime = allHabits.find(h => h.name === 'Screen Time')!;
  const sleep      = allHabits.find(h => h.name === 'Sleep')!;
  const stretching = allHabits.find(h => h.name === 'Stretching')!;

  const runValues      = [4, 6, 5, 3, 7, 5, 4, 6, 8, 5, 3, 6, 4, 7, 5];
  const proteinValues  = [145, 160, 120, 175, 155, 140, 160, 130, 165, 150, 145, 170, 135, 155, 150];
  const screenValues   = [180, 210, 150, 240, 120, 175, 155, 200, 130, 190, 165, 220, 145, 170, 180];
  const sleepValues    = [420, 360, 480, 300, 480, 420, 420, 390, 450, 480, 360, 420, 480, 420, 390];
  const stretchValues  = [15, 20, 15, 25, 20, 15, 30, 20, 15, 25, 20, 15, 20, 25, 15];

  const logEntries: {
    userId: number;
    habitId: number;
    date: string;
    value: number;
    notes: string | null;
  }[] = [];

  for (let i = 180; i >= 0; i--) {
    const date  = daysAgo(i);
    const cycle = i % 15;

    if (i % 3 === 0) {
      logEntries.push({
        userId,
        habitId: run.id,
        date,
        value: runValues[cycle % runValues.length],
        notes: i === 7 ? 'Personal best!' : i === 1 ? 'Felt great' : null,
      });
    }

    if (i % 2 === 0) {
      logEntries.push({
        userId,
        habitId: gym.id,
        date,
        value: 1,
        notes: i === 6 ? 'Leg day' : i === 3 ? 'Upper body' : null,
      });
    }

    if (i % 5 !== 0) {
      logEntries.push({
        userId,
        habitId: protein.id,
        date,
        value: proteinValues[cycle % proteinValues.length],
        notes: i === 7 ? 'Chicken and eggs' : null,
      });
    }

    logEntries.push({
      userId,
      habitId: screenTime.id,
      date,
      value: screenValues[cycle % screenValues.length],
      notes: i === 5 ? 'Stayed off phone' : null,
    });

    logEntries.push({
      userId,
      habitId: sleep.id,
      date,
      value: sleepValues[cycle % sleepValues.length],
      notes: i === 9 ? 'Great sleep' : i === 7 ? 'Late night' : null,
    });

    if (i % 3 === 1) {
      logEntries.push({
        userId,
        habitId: stretching.id,
        date,
        value: stretchValues[cycle % stretchValues.length],
        notes: i === 3 ? 'Full body stretch' : null,
      });
    }
  }

  const BATCH_SIZE = 40;
  for (let i = 0; i < logEntries.length; i += BATCH_SIZE) {
    await db.insert(habitLogs).values(logEntries.slice(i, i + BATCH_SIZE));
  }

  await db.insert(targets).values([
    { userId, habitId: run.id,        type: 'weekly',  goal: 20,    direction: 'min' },
    { userId, habitId: gym.id,        type: 'weekly',  goal: 3,     direction: 'min' },
    { userId, habitId: protein.id,    type: 'weekly',  goal: 150,   direction: 'min' },
    { userId, habitId: screenTime.id, type: 'monthly', goal: 3000,  direction: 'max' },
    { userId, habitId: sleep.id,      type: 'monthly', goal: 12600, direction: 'min' },
    { userId, habitId: stretching.id, type: 'weekly',  goal: 60,    direction: 'min' },
  ]);
}
