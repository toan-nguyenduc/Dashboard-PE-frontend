import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { APP_CONFIG } from '@/config/app.config';
import type { AuthState, LoginRequest } from '@/types/auth.types';

export interface AuthContextType extends AuthState {
  login: (credentials?: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (name: string) => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: localStorage.getItem(APP_CONFIG.storage.token) || 'dev-token',
    username: localStorage.getItem(APP_CONFIG.storage.username) || 'dev_admin',
    isAuthenticated: true, // BYPASS AUTH
  });
  const [isLoading] = useState(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(APP_CONFIG.storage.token);
    localStorage.removeItem(APP_CONFIG.storage.username);
    setAuthState({ token: null, username: null, isAuthenticated: false });
  }, []);

  const updateUser = useCallback((name: string) => {
    localStorage.setItem(APP_CONFIG.storage.username, name);
    setAuthState((prev) => ({ ...prev, username: name }));
  }, []);

  const login = useCallback(
    async (credentials?: LoginRequest) => {
      if (!credentials) {
        throw new Error('Vui lòng nhập tài khoản và mật khẩu');
      }

      // Local fallback / direct credentials login
      if (
        (credentials.username === 'dev_admin' && credentials.password === '123456a@') ||
        credentials.username.length > 0
      ) {
        const dummyToken = 'dev_demo_jwt_token_' + Date.now();
        localStorage.setItem(APP_CONFIG.storage.token, dummyToken);
        localStorage.setItem(APP_CONFIG.storage.username, credentials.username);
        setAuthState({
          token: dummyToken,
          username: credentials.username,
          isAuthenticated: true,
        });
        return;
      }
      throw new Error('Sai tài khoản hoặc mật khẩu');
    },
    []
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...authState,
      login,
      logout,
      updateUser,
      isLoading,
    }),
    [authState, login, logout, updateUser, isLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
