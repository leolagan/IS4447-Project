import { AppColours, DarkColours } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colours: typeof AppColours;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colours: AppColours,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme').then(value => {
      if (value === 'dark') setIsDark(true);
    });
  }, []);

  function toggleTheme() {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }

  const colours = isDark ? DarkColours : AppColours;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colours }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
