import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { keycloak } from '@/config/keycloak.config';
import { APP_CONFIG } from '@/config/app.config';
import type { AuthState, LoginRequest } from '@/types/auth.types';

export interface AuthContextType extends AuthState {
  login: (credentials?: LoginRequest) => Promise<void>;
  loginWithKeycloak: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isKeycloakReady: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: localStorage.getItem(APP_CONFIG.storage.token),
    username: localStorage.getItem(APP_CONFIG.storage.username),
    isAuthenticated: !!localStorage.getItem(APP_CONFIG.storage.token),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isKeycloakReady, setIsKeycloakReady] = useState(false);

  // Initialize Keycloak on application mount
  useEffect(() => {
    let refreshTimer: NodeJS.Timeout | null = null;

    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        setIsKeycloakReady(true);
        if (authenticated && keycloak.token) {
          const user =
            keycloak.tokenParsed?.preferred_username ||
            keycloak.tokenParsed?.name ||
            keycloak.tokenParsed?.sub ||
            'Keycloak User';

          localStorage.setItem(APP_CONFIG.storage.token, keycloak.token);
          localStorage.setItem(APP_CONFIG.storage.username, user);

          setAuthState({
            token: keycloak.token,
            username: user,
            isAuthenticated: true,
          });

          // Silent token refresh: check every 30 seconds, refresh if expires in 70s
          refreshTimer = setInterval(() => {
            keycloak
              .updateToken(70)
              .then((refreshed) => {
                if (refreshed && keycloak.token) {
                  localStorage.setItem(APP_CONFIG.storage.token, keycloak.token);
                  setAuthState((prev) => ({ ...prev, token: keycloak.token! }));
                }
              })
              .catch((err) => {
                console.warn('Silent token refresh failed:', err);
              });
          }, 30000);
        } else {
          // If not authenticated via Keycloak, check if local storage session exists
          const localToken = localStorage.getItem(APP_CONFIG.storage.token);
          const localUser = localStorage.getItem(APP_CONFIG.storage.username);
          if (localToken && localUser) {
            setAuthState({
              token: localToken,
              username: localUser,
              isAuthenticated: true,
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Keycloak init offline/fallback mode:', err);
        // Fallback for local preview if Keycloak server is not running
        const localToken = localStorage.getItem(APP_CONFIG.storage.token);
        const localUser = localStorage.getItem(APP_CONFIG.storage.username);
        if (localToken && localUser) {
          setAuthState({
            token: localToken,
            username: localUser,
            isAuthenticated: true,
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(APP_CONFIG.storage.token);
    localStorage.removeItem(APP_CONFIG.storage.username);
    setAuthState({ token: null, username: null, isAuthenticated: false });
  }, []);

  const loginWithKeycloak = useCallback(async () => {
    try {
      await keycloak.login({
        redirectUri: window.location.origin + '/',
      });
    } catch (err) {
      console.error('Keycloak login error:', err);
      throw err;
    }
  }, []);

  const login = useCallback(
    async (credentials?: LoginRequest) => {
      if (!credentials) {
        return loginWithKeycloak();
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
    [loginWithKeycloak]
  );

  const logout = useCallback(() => {
    clearAuth();
    if (keycloak.authenticated) {
      keycloak.logout({
        redirectUri: window.location.origin + '/login',
      });
    }
  }, [clearAuth]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...authState,
      login,
      loginWithKeycloak,
      logout,
      isLoading,
      isKeycloakReady,
    }),
    [authState, login, loginWithKeycloak, logout, isLoading, isKeycloakReady]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
