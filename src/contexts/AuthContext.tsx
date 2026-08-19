import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '@/api/services/auth';
import type { User } from '@/api/services/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Accepts a raw JWT already issued elsewhere (e.g. TTF SSO code exchange), stores it, then loads the user. */
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => authApi.getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = authApi.getStoredToken();
    if (!t) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }
    setToken(t);
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) setUser(res.data);
      else setUser(null);
    } catch {
      authApi.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (!res.success || !res.data?.user) throw new Error(res.message || 'Login failed');
    setToken(authApi.getStoredToken());
    setUser(res.data.user);
  }, []);

  const loginWithToken = useCallback(
    async (t: string) => {
      await authApi.storeToken(t);
      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, loginWithToken, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
