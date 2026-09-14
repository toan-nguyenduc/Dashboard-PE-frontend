/**
 * API configuration — all endpoints centralized here.
 * Base URL sourced from environment variable.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://relenting-quickly-overbuilt.ngrok-free.dev/api';

export const API_CONFIG = {
  baseUrl: API_BASE_URL,

  endpoints: {
    auth: {
      login: '/auth/login',
      validate: '/auth/validate',
    },
    videos: {
      list: '/videos',
      all: '/videos/all',
      detail: (id: number) => `/videos/${id}`,
      update: (id: number) => `/videos/${id}`,
      updateStatus: (id: number) => `/videos/${id}/status`,
    },
    csmMedia: {
      list: '/csm-media',
      detail: (id: number) => `/csm-media/${id}`,
      reEncode: (id: number) => `/csm-media/${id}/re-encode`,
    },
  },
} as const;
