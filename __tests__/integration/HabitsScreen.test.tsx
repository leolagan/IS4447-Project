import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

//This swaps expo-sqlite for an in-memory database so tests run in Node without a real device
jest.mock('expo-sqlite', () => {
  const Database = require('better-sqlite3');
  const sqlite = new Database(':memory:');

  return {
    openDatabaseSync: () => ({
      execSync(sql: string) {
        sqlite.exec(sql);
      },
      prepareSync(sql: string) {
        const stmt = sqlite.prepare(sql);
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

//This maps useFocusEffect to useEffect since there is no navigation stack in tests
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => unknown) => {
    const ReactLib = require('react');
    ReactLib.useEffect(() => { cb(); }, []);
  },
}));

//This provides a logged in user so the screen doesn't get blocked by auth checks
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, username: 'Demo' } }),
}));

//This returns empty categories as they aren't relevant to these tests
jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ categories: [] }),
}));

//This stubs out the log hook so the screen can render without needing real log data
jest.mock('@/hooks/useLogs', () => ({
  useLogs: () => ({
    logs: [],
    addLog: jest.fn(),
    updateLog: jest.fn(),
    deleteLog: jest.fn(),
  }),
}));

//This supplies a colour palette so themed components render without errors
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

//This stops the router from throwing when the screen tries to navigate
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

//These are imported after the mocks so they use the fakes set up above
import HabitsScreen from '@/app/(tabs)/index';
import { seedIfEmpty } from '@/db/seed';

//This fills the database with sample data before any of the tests run
beforeAll(async () => {
  await seedIfEmpty();
});

describe('HabitsScreen integration', () => {
  //This checks the screen renders its main heading
  it('renders the My Habits title', async () => {
    const { getByText } = render(<HabitsScreen />);
    await waitFor(() => {
      expect(getByText('My Habits')).toBeTruthy();
    });
  });

  //This checks that habits from the seed data actually appear in the UI
  it('displays habit names loaded from the real in-memory database', async () => {
    const { getByText } = render(<HabitsScreen />);
    await waitFor(() => {
      expect(getByText('Run')).toBeTruthy();
      expect(getByText('Gym Session')).toBeTruthy();
    });
  });
});