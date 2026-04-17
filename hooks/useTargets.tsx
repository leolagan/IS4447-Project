import { useAuth } from '@/context/AuthContext';
import { db } from '@/db/client';
import { habitLogs, habits, targets } from '@/db/schema';
import { getMonthRange, getWeekRange } from '@/utils/dateHelpers';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useCallback, useState } from 'react';

export type TargetWithProgress = {
  id: number;
  habitId: number;
  type: string;
  goal: number;
  direction: string;
  habitName: string;
  habitUnit: string;
  habitMetricType: string;
  habitCategoryId: number;
  progress: number;
  isMet: boolean;
  isExceeded: boolean;
};

export function useTargets() {
  const { user } = useAuth();
  const [data, setData] = useState<TargetWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setIsLoading(true);
    try {
      const allTargets = await db.select().from(targets).where(eq(targets.userId, user.id));
      const allHabits  = await db.select().from(habits).where(eq(habits.userId, user.id));
      const allLogs    = await db.select().from(habitLogs).where(eq(habitLogs.userId, user.id));

      const { start: weekStart,  end: weekEnd  } = getWeekRange();
      const { start: monthStart, end: monthEnd } = getMonthRange();

      const enriched: TargetWithProgress[] = allTargets
        .map(target => {
          const habit = allHabits.find(h => h.id === target.habitId);
          if (!habit) return null;

          const relevantLogs = allLogs.filter(log => {
            if (log.habitId !== target.habitId) return false;
            if (target.type === 'weekly')  return log.date >= weekStart  && log.date <= weekEnd;
            if (target.type === 'monthly') return log.date >= monthStart && log.date <= monthEnd;
            return false;
          });

          let progress: number;
          if (habit.metricType === 'boolean') {
            progress = relevantLogs.filter(l => l.value === 1).length;
          } else {
            progress = relevantLogs.reduce((sum, l) => sum + l.value, 0);
          }

          const isMet      = target.direction === 'min' ? progress >= target.goal : progress <= target.goal;
          const isExceeded = target.direction === 'max' && progress > target.goal;

          return {
            id: target.id,
            habitId: target.habitId,
            type: target.type,
            goal: target.goal,
            direction: target.direction,
            habitName: habit.name,
            habitUnit: habit.unit,
            habitMetricType: habit.metricType,
            habitCategoryId: habit.categoryId,
            progress,
            isMet,
            isExceeded,
          };
        })
        .filter((t): t is TargetWithProgress => t !== null);

      setData(enriched);
      setError(null);
    } catch {
      setError('Failed to load targets.');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [user?.id])
  );

  async function addTarget(habitId: number, type: string, goal: number, direction: string) {
    if (!user) return;
    await db.insert(targets).values({ userId: user.id, habitId, type, goal, direction });
    load();
  }

  async function updateTarget(id: number, habitId: number, type: string, goal: number, direction: string) {
    await db.update(targets).set({ habitId, type, goal, direction }).where(eq(targets.id, id));
    load();
  }

  async function deleteTarget(id: number) {
    await db.delete(targets).where(eq(targets.id, id));
    load();
  }

  return { targets: data, addTarget, updateTarget, deleteTarget, reload: load, isLoading, error };
}
