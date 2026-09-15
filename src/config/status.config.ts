/**
 * Video status code mapping — mirrors the PE system status codes.
 * Used for rendering StatusTag colors and labels in the UI.
 *
 * Status code groups (updated per requirements):
 * - processing: 0, 21, 22, 31, 32, 40, 41, 42, 51, 52, 61, 62, 72
 * - success:    1, 71
 * - failed:     23, 24, 33, 34, 43, 44, 53, 54, 63, 64, 73, 74
 */

export interface StatusInfo {
  label: string;
  color: string;
  group: 'success' | 'processing' | 'failed';
}

export const VIDEO_STATUS_MAP: Record<number, StatusInfo> = {
  // General
  0: { label: 'WAITING CONVERT', color: 'default', group: 'processing' },
  1: { label: 'CONVERT SUCCESS (SYNCED)', color: 'green', group: 'success' },

  // Download/Copy (2x)
  21: { label: 'DOWNLOAD SUCCESS', color: 'cyan', group: 'processing' },
  22: { label: 'DOWNLOADING', color: 'blue', group: 'processing' },
  23: { label: 'DOWNLOAD FAILED', color: 'red', group: 'failed' },
  24: { label: 'DOWNLOAD FAILED (SYNCED)', color: 'volcano', group: 'failed' },

  // Verify (3x)
  31: { label: 'VERIFY SUCCESS', color: 'cyan', group: 'processing' },
  32: { label: 'VERIFYING', color: 'blue', group: 'processing' },
  33: { label: 'VERIFY FAILED', color: 'red', group: 'failed' },
  34: { label: 'VERIFY FAILED (SYNCED)', color: 'volcano', group: 'failed' },

  // Split (4x)
  40: { label: 'WAITING SPLIT', color: 'default', group: 'processing' },
  41: { label: 'WAITING TRANSCODE', color: 'amber', group: 'processing' },
  42: { label: 'SPLITTING', color: 'blue', group: 'processing' },
  43: { label: 'SPLIT FAILED', color: 'red', group: 'failed' },
  44: { label: 'SPLIT FAILED (SYNCED)', color: 'volcano', group: 'failed' },

  // Transcode (5x)
  51: { label: 'TRANSCODE SUCCESS', color: 'cyan', group: 'processing' },
  52: { label: 'TRANSCODING', color: 'blue', group: 'processing' },
  53: { label: 'TRANSCODE FAILED', color: 'red', group: 'failed' },
  54: { label: 'TRANSCODE FAILED (SYNCED)', color: 'volcano', group: 'failed' },

  // Package (6x)
  61: { label: 'PACKAGE SUCCESS', color: 'cyan', group: 'processing' },
  62: { label: 'PACKAGING', color: 'blue', group: 'processing' },
  63: { label: 'PACKAGE FAILED', color: 'red', group: 'failed' },
  64: { label: 'PACKAGE FAILED (SYNCED)', color: 'volcano', group: 'failed' },

  // Upload (7x)
  71: { label: 'UPLOAD SUCCESS', color: 'green', group: 'success' },
  72: { label: 'UPLOADING', color: 'blue', group: 'processing' },
  73: { label: 'UPLOAD FAILED', color: 'red', group: 'failed' },
  74: { label: 'UPLOAD FAILED (SYNCED)', color: 'volcano', group: 'failed' },
};

/**
 * Get status info for a given status code.
 * Returns a fallback for unknown status codes.
 */
export function getStatusInfo(status: number): StatusInfo {
  return VIDEO_STATUS_MAP[status] ?? {
    label: 'UNKNOWN',
    color: 'default',
    group: 'processing' as const,
  };
}

/**
 * Status groups for filtering in the UI.
 * "Chờ xử lý" đã được gộp vào "Đang xử lý" theo yêu cầu mới.
 */
export const STATUS_FILTER_GROUPS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Thành công', value: 'success' },
  { label: 'Thất bại', value: 'failed' },
] as const;

/**
 * Get all status codes belonging to a specific group.
 */
export function getStatusCodesByGroup(group: string): number[] {
  if (group === 'all') return [];
  return Object.entries(VIDEO_STATUS_MAP)
    .filter(([, info]) => info.group === group)
    .map(([code]) => Number(code));
}

/**
 * Status codes where reconvert is NOT allowed (actively being processed).
 */
export const RECONVERT_LOCKED_STATUSES = new Set([22, 32, 42, 52, 62, 72]);

/** Check if a video can be reconverted based on its status. */
export function canReconvert(status: number): boolean {
  return !RECONVERT_LOCKED_STATUSES.has(status);
}

/** Check if video is in a fully success state (1 or 71) — needs CSM re-encode path. */
export function isFullSuccess(status: number): boolean {
  return status === 1 || status === 71;
}
