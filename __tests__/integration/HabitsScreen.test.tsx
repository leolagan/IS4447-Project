import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('expo-sqlite', () => {
  const Database = require('better-sqlite3');
  const sqlite = new Database(':memory:');

  return {
    openDatabaseSync: () => ({
      execSync(sql: string) {
        sqlite.exec(sql);
      },
      prepareSync(sql: string) {
        const stmt    = sqlite.prepare(sql);
        return {
          executeSync(params: unknown[] = []) {
            let cached: ReturnType<typeof stmt.run> | null = null;
            const execDml = () => { if (!cached) cached = stmt.run(params); return cached!; };
            return {
              getAllSync:    () => stmt.all(params),
              getFirstSync:  () => stmt.get(params) ?? null,
              get changes()        { return execDml().changes; },
              get lastInsertRowId() { return Number(execDml().lastInsertRowid); },
            };
          },
          executeForRawResultSync(params: unknown[] = []) {
            const stmtRaw = sqlite.prepare(sql).raw(true);
            return { getAllSync: () => stmtRaw.all(params) };
          },
        };
      },
    }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => unknown) => {
    const ReactLib = require('react');
    ReactLib.useEffect(() => { cb(); }, []);
  },
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, username: 'Demo' } }),
}));

jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ categories: [] }),
}));

jest.mock('@/hooks/useLogs', () => ({
  useLogs: () => ({
    logs: [],
    addLog: jest.fn(),
    updateLog: jest.fn(),
    deleteLog: jest.fn(),
  }),
}));

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colours: {
      primary: '#10C9A0', primaryLight: '#DCF9F1',
      background: '#F5F8F7', card: '#FFFFFF',
      text: '#0D1F19', subtext: '#6B8C83',
      border: '#DDE9E5', danger: '#F0524A',
      dangerLight: '#FEE9E8', edit: '#10C9A0', editLight: '#DCF9F1',
      success: '#20C164',
    },
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import { seedIfEmpty } from '@/db/seed';
import HabitsScreen from '@/app/(tabs)/index';

beforeAll(async () => {
  await seedIfEmpty();
});

describe('HabitsScreen integration', () => {
  it('renders the My Habits title', async () => {
    const { getByText } = render(<HabitsScreen />);
    await waitFor(() => {
      expect(getByText('My Habits')).toBeTruthy();
    });
  });

  it('displays habit names loaded from the real in-memory database', async () => {
    const { getByText } = render(<HabitsScreen />);
    await waitFor(() => {
      expect(getByText('Run')).toBeTruthy();
      expect(getByText('Gym Session')).toBeTruthy();
    });
  });
});
