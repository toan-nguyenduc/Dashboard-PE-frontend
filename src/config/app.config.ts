/**
 * Application-level configuration constants.
 * All values sourced from environment variables with sensible defaults.
 */
export const APP_CONFIG = {
  title: import.meta.env.VITE_APP_TITLE || 'Dashboard PE',
  pollingIntervalMs: Number(import.meta.env.VITE_POLLING_INTERVAL) || 30000,

  /** localStorage keys */
  storage: {
    token: 'dashboard_pe_token',
    username: 'dashboard_pe_username',
  },

  /** Pagination defaults */
  pagination: {
    defaultPageSize: 50,
    pageSizeOptions: [20, 50, 100, 200],
  },
} as const;
