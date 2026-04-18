export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export function parseDisplayDate(displayDate: string): string {
  const [d, m, y] = displayDate.split('/');
  return `${y}-${m}-${d}`;
}

export function isValidDisplayDate(s: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return false;
  const [d, m, y] = s.split('/').map(Number);
  if (m < 1 || m > 12) return false;
  const maxDay = new Date(y, m, 0).getDate();
  return d >= 1 && d <= maxDay;
}

export function getWeekRange(): { start: string; end: string } {
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

export function getMonthRange(): { start: string; end: string } {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0],
  };
}

export function calcStreak(logDates: string[]): number {
  if (logDates.length === 0) return 0;
  const DAY = 86400000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();

  const unique = [...new Set(logDates)]
    .map(d => { const dt = new Date(d); dt.setHours(0, 0, 0, 0); return dt.getTime(); })
    .sort((a, b) => b - a);

  // Streak must include today or yesterday to be considered active
  if (unique[0] !== todayTs && unique[0] !== todayTs - DAY) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i - 1] - unique[i] === DAY) streak++;
    else break;
  }
  return streak;
}
