//This imports the habit logs schema type needed for typing the log records
import { habitLogs } from '@/db/schema';

type Log = typeof habitLogs.$inferSelect;

//This converts a list of log entries into a CSV string with habit name, date, value and notes columns
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