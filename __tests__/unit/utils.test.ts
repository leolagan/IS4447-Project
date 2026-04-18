import { formatDisplayDate, calcStreak } from '@/utils/dateHelpers';
import { formatMinutes } from '@/utils/formatters';

describe('Utility functions', () => {
  test('formatDisplayDate converts ISO date to DD/MM/YYYY', () => {
    expect(formatDisplayDate('2024-03-15')).toBe('15/03/2024');
  });

  test('calcStreak returns 0 when no logs exist', () => {
    expect(calcStreak([])).toBe(0);
  });

  test('formatMinutes formats 90 minutes as "1h 30m"', () => {
    expect(formatMinutes(90)).toBe('1h 30m');
  });
});
