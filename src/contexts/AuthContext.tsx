import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/src/types';
import { checkInToday } from '@/src/services/attendanceService';

interface AuthContextValue {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO: Initialize from AsyncStorage or SecureStore for persistent sessions
  const [user, setUserState] = useState<User | null>(null);

  function setUser(u: User) {
    setUserState(u);
    checkInToday(u.id).catch(() => {});
  }

  function logout() {
    // TODO: Clear persisted session from AsyncStorage/SecureStore here
    setUserState(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
