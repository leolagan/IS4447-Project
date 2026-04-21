import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

export type SessionUser = { id: number; username: string };

type AuthContextType = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [_user, _setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('session').then(raw => {
      if (raw) _setUser(JSON.parse(raw));
      setLoaded(true);
    });
  }, []);

  function setUser(user: SessionUser | null) {
    _setUser(user);
    if (user) {
      AsyncStorage.setItem('session', JSON.stringify(user));
    } else {
      AsyncStorage.removeItem('session');
    }
  }

  if (!loaded) return null;

  return (
    <AuthContext.Provider value={{ user: _user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
