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
      primary: '#1C8DB3', primaryLight: '#E7F5FF',
      background: '#F8F9FA', card: '#FFFFFF',
      text: '#212529', subtext: '#868E96',
      border: '#DEE2E6', danger: '#FA5252',
      dangerLight: '#FFF5F5', edit: '#2AA7C9', editLight: '#E3F9FF',
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
