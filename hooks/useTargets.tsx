import { db } from '@/db/client';
import { habitLogs, habits, targets } from '@/db/schema';
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

function getWeekRange(): { start: string; end: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

function getMonthRange(): { start: string; end: string } {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0],
  };
}

export function useTargets() {
  const [data, setData] = useState<TargetWithProgress[]>([]);

  async function load() {
    const allTargets = await db.select().from(targets);
    const allHabits  = await db.select().from(habits);
    const allLogs    = await db.select().from(habitLogs);

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
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function addTarget(habitId: number, type: string, goal: number, direction: string) {
    await db.insert(targets).values({ habitId, type, goal, direction });
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

  return { targets: data, addTarget, updateTarget, deleteTarget, reload: load };
}
