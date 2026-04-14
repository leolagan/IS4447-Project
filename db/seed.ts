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

  // Categories
  await db.insert(categories).values([
    { name: 'Fitness',   color: '#FF6B6B' },
    { name: 'Nutrition', color: '#51CF66' },
    { name: 'Wellness',  color: '#845EF7' },
    { name: 'Recovery',  color: '#339AF0' },
  ]);

  const cats = await db.select().from(categories);
  const fitness   = cats.find(c => c.name === 'Fitness')!;
  const nutrition = cats.find(c => c.name === 'Nutrition')!;
  const wellness  = cats.find(c => c.name === 'Wellness')!;
  const recovery  = cats.find(c => c.name === 'Recovery')!;

  // Habits
  await db.insert(habits).values([
    { name: 'Run',          metricType: 'count',   unit: 'km',       categoryId: fitness.id },
    { name: 'Gym Session',  metricType: 'boolean', unit: 'session',  categoryId: fitness.id },
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

  // Logs
  await db.insert(habitLogs).values([
    // Run
    { habitId: run.id, date: daysAgo(13), value: 5,  notes: 'Good morning run' },
    { habitId: run.id, date: daysAgo(10), value: 3,  notes: null },
    { habitId: run.id, date: daysAgo(7),  value: 6,  notes: 'Personal best!' },
    { habitId: run.id, date: daysAgo(4),  value: 4,  notes: null },
    { habitId: run.id, date: daysAgo(1),  value: 5,  notes: 'Felt great' },

    // Gym Session
    { habitId: gym.id, date: daysAgo(12), value: 1, notes: null },
    { habitId: gym.id, date: daysAgo(9),  value: 1, notes: 'Leg day' },
    { habitId: gym.id, date: daysAgo(6),  value: 1, notes: null },
    { habitId: gym.id, date: daysAgo(3),  value: 1, notes: 'Upper body' },

    // Protein Goal
    { habitId: protein.id, date: daysAgo(13), value: 145, notes: null },
    { habitId: protein.id, date: daysAgo(11), value: 160, notes: null },
    { habitId: protein.id, date: daysAgo(9),  value: 120, notes: null },
    { habitId: protein.id, date: daysAgo(7),  value: 175, notes: 'Chicken and eggs' },
    { habitId: protein.id, date: daysAgo(5),  value: 155, notes: null },
    { habitId: protein.id, date: daysAgo(3),  value: 140, notes: null },
    { habitId: protein.id, date: daysAgo(1),  value: 160, notes: null },

    // Screen Time (stored in minutes)
    { habitId: screenTime.id, date: daysAgo(13), value: 180, notes: null },
    { habitId: screenTime.id, date: daysAgo(11), value: 210, notes: null },
    { habitId: screenTime.id, date: daysAgo(9),  value: 150, notes: 'Good day' },
    { habitId: screenTime.id, date: daysAgo(7),  value: 240, notes: null },
    { habitId: screenTime.id, date: daysAgo(5),  value: 120, notes: 'Stayed off phone' },
    { habitId: screenTime.id, date: daysAgo(3),  value: 175, notes: null },
    { habitId: screenTime.id, date: daysAgo(1),  value: 155, notes: null },

    // Sleep (stored in minutes)
    { habitId: sleep.id, date: daysAgo(13), value: 420, notes: null },
    { habitId: sleep.id, date: daysAgo(11), value: 360, notes: null },
    { habitId: sleep.id, date: daysAgo(9),  value: 480, notes: 'Great sleep' },
    { habitId: sleep.id, date: daysAgo(7),  value: 300, notes: 'Late night' },
    { habitId: sleep.id, date: daysAgo(5),  value: 480, notes: null },
    { habitId: sleep.id, date: daysAgo(3),  value: 420, notes: null },
    { habitId: sleep.id, date: daysAgo(1),  value: 420, notes: null },

    // Stretching
    { habitId: stretching.id, date: daysAgo(12), value: 15, notes: null },
    { habitId: stretching.id, date: daysAgo(9),  value: 20, notes: null },
    { habitId: stretching.id, date: daysAgo(6),  value: 15, notes: null },
    { habitId: stretching.id, date: daysAgo(3),  value: 25, notes: 'Full body stretch' },
    { habitId: stretching.id, date: daysAgo(1),  value: 20, notes: null },
  ]);

  // Targets
  await db.insert(targets).values([
    { habitId: run.id,        type: 'weekly', goal: 20,  direction: 'min' },
    { habitId: gym.id,        type: 'weekly', goal: 3,   direction: 'min' },
    { habitId: protein.id,    type: 'weekly', goal: 150, direction: 'min' },
    { habitId: screenTime.id, type: 'daily',  goal: 120, direction: 'max' },
    { habitId: sleep.id,      type: 'daily',  goal: 420, direction: 'min' },
    { habitId: stretching.id, type: 'weekly', goal: 60,  direction: 'min' },
  ]);
}
