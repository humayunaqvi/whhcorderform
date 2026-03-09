'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, login as authLogin, logout as authLogout, seedDefaultUsers, getUserData, refreshSession } from './auth';
import type { Session } from '@/types';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDefaultUsers().then(async () => {
      const s = getSession();
      if (s) {
        // Sync session role/displayName from Firebase in case they changed
        const updated = await refreshSession(s);
        setSession(updated);
      }
      setLoading(false);
    });
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const s = await authLogin(username, password);
    if (s) {
      setSession(s);
      return true;
    }
    return false;
  };

  const logout = () => {
    authLogout();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
