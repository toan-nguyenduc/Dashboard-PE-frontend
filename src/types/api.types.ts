/**
 * Common API response wrapper types — mirrors backend ApiResponse<T> and PageResponse<T>.
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  timestamp: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
