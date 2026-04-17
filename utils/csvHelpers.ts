import { habitLogs } from '@/db/schema';

type Log = typeof habitLogs.$inferSelect;

export function buildCsv(
  logs: Log[],
  habitMap: Record<number, string>,
): string {
  const header = 'Habit,Date,Value,Notes';
  const rows = logs.map(l => {
    const name  = (habitMap[l.habitId] ?? '').replace(/,/g, ' ');
    const notes = (l.notes ?? '').replace(/,/g, ' ').replace(/\n/g, ' ');
    return `${name},${l.date},${l.value},${notes}`;
  });
  return [header, ...rows].join('\n');
}
