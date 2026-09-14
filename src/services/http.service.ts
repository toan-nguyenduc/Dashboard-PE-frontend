import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { API_CONFIG } from '../config/api.config';
import { APP_CONFIG } from '../config/app.config';
import { keycloak } from '../config/keycloak.config';

/**
 * Configured Axios instance for all API calls.
 *
 * - Automatically attaches Keycloak JWT Bearer token on every request.
 * - Handles 401 Unauthorized globally by clearing auth state and redirecting to login.
 * - Handles 403 Forbidden globally by displaying error toast.
 */
const httpClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Request interceptor — attach JWT Bearer token */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Prefer Keycloak token, fallback to localStorage
    const token = keycloak.token || localStorage.getItem(APP_CONFIG.storage.token);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/** Response interceptor — handle 401 & 403 globally */
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;

    if (status === 401) {
      localStorage.removeItem(APP_CONFIG.storage.token);
      localStorage.removeItem(APP_CONFIG.storage.username);
      toast.error('Phiên làm việc đã hết hạn hoặc chưa đăng nhập (401 Unauthorized).');

      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
      }
    } else if (status === 403) {
      toast.error(
        errorMessage || 'Từ chối truy cập (403 Forbidden): Domain không hợp lệ hoặc không có quyền truy cập.'
      );
    }

    return Promise.reject(error);
  }
);

export default httpClient;
