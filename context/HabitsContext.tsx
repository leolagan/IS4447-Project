import { useHabits } from '@/hooks/useHabits';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

type HabitsContextType = ReturnType<typeof useHabits>;

const HabitsContext = createContext<HabitsContextType | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const value = useHabits();

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabitsContext(): HabitsContextType {
  const ctx = useContext(HabitsContext);
  const hook = useHabits();
  return ctx ?? hook;
}
