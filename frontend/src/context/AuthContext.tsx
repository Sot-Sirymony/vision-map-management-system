import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, AuthState } from '../types/auth';

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  setSession: (response: AuthResponse) => void;
  logout: () => void;
};

const STORAGE_KEY = 'visionMappingAuth';

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): AuthState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { token: null, user: null };
  }

  try {
    return JSON.parse(stored) as AuthState;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => readStoredAuth());

  const value = useMemo<AuthContextValue>(() => ({
    ...auth,
    isAuthenticated: Boolean(auth.token),
    setSession: (response) => {
      const nextAuth: AuthState = {
        token: response.token,
        user: {
          id: response.userId,
          fullName: response.fullName,
          email: response.email,
          role: response.role,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
      setAuth(nextAuth);
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      setAuth({ token: null, user: null });
    },
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
