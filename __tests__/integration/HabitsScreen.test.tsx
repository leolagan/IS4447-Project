import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('@/hooks/useHabits', () => ({
  useHabits: () => ({
    habits: [
      { id: 1, userId: 1, name: 'Morning Run', metricType: 'count', unit: 'km', categoryId: 1 },
    ],
    deleteHabit: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [{ id: 1, userId: 1, name: 'Fitness', color: '#FF6B6B' }],
  }),
}));

jest.mock('@/hooks/useLogs', () => ({
  useLogs: () => ({ logs: [], isLoading: false, error: null }),
}));

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colours: {
      primary: '#10C9A0', primaryLight: '#DCF9F1',
      background: '#F5F8F7', card: '#FFFFFF',
      text: '#0D1F19', subtext: '#6B8C83',
      border: '#DDE9E5', danger: '#F0524A',
      dangerLight: '#FEE9E8', edit: '#7C5CFC', editLight: '#EDE9FF',
      success: '#20C164',
    },
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue([{ q: 'Test quote', a: 'Author' }]),
}) as jest.Mock;

import HabitsScreen from '@/app/(tabs)/index';

describe('HabitsScreen', () => {
  it('renders the My Habits title', () => {
    const { getByText } = render(<HabitsScreen />);
    expect(getByText('My Habits')).toBeTruthy();
  });

  it('displays a habit name from state', async () => {
    const { getByText } = render(<HabitsScreen />);
    await waitFor(() => {
      expect(getByText('Morning Run')).toBeTruthy();
    });
  });
});
