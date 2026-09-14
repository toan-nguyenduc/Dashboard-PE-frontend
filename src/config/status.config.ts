/**
 * Video status code mapping — mirrors the PE system status codes.
 * Used for rendering StatusTag colors and labels in the UI.
 *
 * Status code groups:
 * - 0:       Waiting
 * - x1:      Step success
 * - x2:      Step in progress
 * - x3:      Step failed
 * - x4:      Step failed (synced back to CSM)
 */

export interface StatusInfo {
  label: string;
  color: string;
  group: 'waiting' | 'success' | 'processing' | 'failed';
}

export const VIDEO_STATUS_MAP: Record<number, StatusInfo> = {
  // General
  0:  { label: 'Chờ convert',                        color: 'default',    group: 'waiting' },
  1:  { label: 'Convert thành công',                 color: 'green',      group: 'success' },

  // Download/Copy (2x)
  21: { label: 'Download thành công',                color: 'cyan',       group: 'success' },
  22: { label: 'Đang download',                      color: 'blue',       group: 'processing' },
  23: { label: 'Download thất bại',                  color: 'red',        group: 'failed' },
  24: { label: 'Download thất bại (đã đồng bộ)',     color: 'volcano',    group: 'failed' },

  // Verify (3x)
  31: { label: 'Verify thành công',                  color: 'cyan',       group: 'success' },
  32: { label: 'Đang verify',                        color: 'blue',       group: 'processing' },
  33: { label: 'Verify thất bại',                    color: 'red',        group: 'failed' },
  34: { label: 'Verify thất bại (đã đồng bộ)',       color: 'volcano',    group: 'failed' },

  // Split (4x)
  40: { label: 'Chờ split',                          color: 'default',    group: 'waiting' },
  41: { label: 'Split thành công',                   color: 'cyan',       group: 'success' },
  42: { label: 'Đang split',                         color: 'blue',       group: 'processing' },
  43: { label: 'Split thất bại',                     color: 'red',        group: 'failed' },
  44: { label: 'Split thất bại (đã đồng bộ)',        color: 'volcano',    group: 'failed' },

  // Transcode (5x)
  51: { label: 'Transcode thành công',               color: 'cyan',       group: 'success' },
  52: { label: 'Đang transcode',                     color: 'blue',       group: 'processing' },
  53: { label: 'Transcode thất bại',                 color: 'red',        group: 'failed' },
  54: { label: 'Transcode thất bại (đã đồng bộ)',    color: 'volcano',    group: 'failed' },

  // Package (6x)
  61: { label: 'Package thành công',                 color: 'cyan',       group: 'success' },
  62: { label: 'Đang package',                       color: 'blue',       group: 'processing' },
  63: { label: 'Package thất bại',                   color: 'red',        group: 'failed' },
  64: { label: 'Package thất bại (đã đồng bộ)',      color: 'volcano',    group: 'failed' },

  // Upload (7x)
  71: { label: 'Upload thành công',                  color: 'green',      group: 'success' },
  72: { label: 'Đang upload',                        color: 'blue',       group: 'processing' },
  73: { label: 'Upload thất bại',                    color: 'red',        group: 'failed' },
  74: { label: 'Upload thất bại (đã đồng bộ)',       color: 'volcano',    group: 'failed' },
};

/**
 * Get status info for a given status code.
 * Returns a fallback for unknown status codes.
 */
export function getStatusInfo(status: number): StatusInfo {
  return VIDEO_STATUS_MAP[status] ?? {
    label: `Unknown (${status})`,
    color: 'default',
    group: 'waiting' as const,
  };
}

/**
 * Status groups for filtering in the UI.
 */
export const STATUS_FILTER_GROUPS = [
  { label: 'Tất cả',        value: 'all' },
  { label: 'Đang xử lý',    value: 'processing' },
  { label: 'Thành công',     value: 'success' },
  { label: 'Thất bại',       value: 'failed' },
  { label: 'Chờ xử lý',     value: 'waiting' },
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
