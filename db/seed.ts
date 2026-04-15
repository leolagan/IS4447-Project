import { db } from './client';
import { categories, habitLogs, habits, targets } from './schema';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export async function seedIfEmpty() {
  const existing = await db.select().from(categories);
  if (existing.length > 0) return;

  // ── Categories ────────────────────────────────────────────────────────────
  await db.insert(categories).values([
    { name: 'Fitness',   colour: '#FF6B6B' },
    { name: 'Nutrition', colour: '#51CF66' },
    { name: 'Wellness',  colour: '#845EF7' },
    { name: 'Recovery',  colour: '#339AF0' },
  ]);

  const cats      = await db.select().from(categories);
  const fitness   = cats.find(c => c.name === 'Fitness')!;
  const nutrition = cats.find(c => c.name === 'Nutrition')!;
  const wellness  = cats.find(c => c.name === 'Wellness')!;
  const recovery  = cats.find(c => c.name === 'Recovery')!;

  // ── Habits ────────────────────────────────────────────────────────────────
  await db.insert(habits).values([
    { name: 'Run',          metricType: 'count',   unit: 'km',       categoryId: fitness.id },
    { name: 'Gym Session',  metricType: 'boolean', unit: 'boolean',  categoryId: fitness.id },
    { name: 'Protein Goal', metricType: 'count',   unit: 'grams',    categoryId: nutrition.id },
    { name: 'Screen Time',  metricType: 'count',   unit: 'hrs/mins', categoryId: wellness.id },
    { name: 'Sleep',        metricType: 'count',   unit: 'hrs/mins', categoryId: recovery.id },
    { name: 'Stretching',   metricType: 'count',   unit: 'minutes',  categoryId: recovery.id },
  ]);

  const allHabits  = await db.select().from(habits);
  const run        = allHabits.find(h => h.name === 'Run')!;
  const gym        = allHabits.find(h => h.name === 'Gym Session')!;
  const protein    = allHabits.find(h => h.name === 'Protein Goal')!;
  const screenTime = allHabits.find(h => h.name === 'Screen Time')!;
  const sleep      = allHabits.find(h => h.name === 'Sleep')!;
  const stretching = allHabits.find(h => h.name === 'Stretching')!;

  // ── Logs — 180 days of history (fills daily, weekly, and monthly charts) ──
  // Deterministic value arrays — cycled via index so no Math.random needed
  const runValues      = [4, 6, 5, 3, 7, 5, 4, 6, 8, 5, 3, 6, 4, 7, 5];
  const proteinValues  = [145, 160, 120, 175, 155, 140, 160, 130, 165, 150, 145, 170, 135, 155, 150];
  const screenValues   = [180, 210, 150, 240, 120, 175, 155, 200, 130, 190, 165, 220, 145, 170, 180];
  const sleepValues    = [420, 360, 480, 300, 480, 420, 420, 390, 450, 480, 360, 420, 480, 420, 390];
  const stretchValues  = [15, 20, 15, 25, 20, 15, 30, 20, 15, 25, 20, 15, 20, 25, 15];

  const logEntries: {
    habitId: number;
    date: string;
    value: number;
    notes: string | null;
  }[] = [];

  for (let i = 180; i >= 0; i--) {
    const date  = daysAgo(i);
    const cycle = i % 15;

    // Run — every 3rd day
    if (i % 3 === 0) {
      logEntries.push({
        habitId: run.id,
        date,
        value: runValues[cycle % runValues.length],
        notes: i === 7 ? 'Personal best!' : i === 1 ? 'Felt great' : null,
      });
    }

    // Gym — every 2nd day
    if (i % 2 === 0) {
      logEntries.push({
        habitId: gym.id,
        date,
        value: 1,
        notes: i === 6 ? 'Leg day' : i === 3 ? 'Upper body' : null,
      });
    }

    // Protein — every day, skip every 5th (realistic misses)
    if (i % 5 !== 0) {
      logEntries.push({
        habitId: protein.id,
        date,
        value: proteinValues[cycle % proteinValues.length],
        notes: i === 7 ? 'Chicken and eggs' : null,
      });
    }

    // Screen Time — every day
    logEntries.push({
      habitId: screenTime.id,
      date,
      value: screenValues[cycle % screenValues.length],
      notes: i === 5 ? 'Stayed off phone' : null,
    });

    // Sleep — every day
    logEntries.push({
      habitId: sleep.id,
      date,
      value: sleepValues[cycle % sleepValues.length],
      notes: i === 9 ? 'Great sleep' : i === 7 ? 'Late night' : null,
    });

    // Stretching — every 3rd day (offset)
    if (i % 3 === 1) {
      logEntries.push({
        habitId: stretching.id,
        date,
        value: stretchValues[cycle % stretchValues.length],
        notes: i === 3 ? 'Full body stretch' : null,
      });
    }
  }

  // Batch inserts — keeps each statement well under SQLite's parameter limit
  const BATCH_SIZE = 40;
  for (let i = 0; i < logEntries.length; i += BATCH_SIZE) {
    await db.insert(habitLogs).values(logEntries.slice(i, i + BATCH_SIZE));
  }

  // ── Targets ───────────────────────────────────────────────────────────────
  await db.insert(targets).values([
    { habitId: run.id,        type: 'weekly',  goal: 20,    direction: 'min' },
    { habitId: gym.id,        type: 'weekly',  goal: 3,     direction: 'min' },
    { habitId: protein.id,    type: 'weekly',  goal: 150,   direction: 'min' },
    { habitId: screenTime.id, type: 'monthly', goal: 3000,  direction: 'max' },
    { habitId: sleep.id,      type: 'monthly', goal: 12600, direction: 'min' },
    { habitId: stretching.id, type: 'weekly',  goal: 60,    direction: 'min' },
  ]);
}
