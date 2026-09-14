/**
 * Auth-related type definitions.
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  expiresIn: number;
}

export interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
}
