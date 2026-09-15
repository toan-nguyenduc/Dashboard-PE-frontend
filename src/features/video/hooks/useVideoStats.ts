import { useState, useEffect, useRef, useCallback } from 'react';
import { videoService } from '../services/video.service';
import type { VideoStats, VideoFilterParams } from '@/types/video.types';
import { APP_CONFIG } from '@/config/app.config';

/**
 * Hook to fetch PE system statistics filtered by current search / attribute criteria.
 * Auto-polls on the same interval as video list.
 */
export function useVideoStats(filters?: Partial<VideoFilterParams>) {
  const [stats, setStats] = useState<VideoStats>({ total: 0, processing: 0, failed: 0, success: 0 });
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await videoService.getStats({
        search: filters?.search ? filters.search.trim() : undefined,
        csmMediaId: filters?.csmMediaId,
        fileType: filters?.fileType,
        resolution: filters?.resolution,
        convertServer: filters?.convertServer,
      });
      if (isMounted.current) setStats(data);
    } finally {
      if (isMounted.current && !silent) setLoading(false);
    }
  }, [filters?.search, filters?.csmMediaId, filters?.fileType, filters?.resolution, filters?.convertServer]);

  useEffect(() => {
    isMounted.current = true;
    fetchStats();
    const interval = setInterval(() => fetchStats(true), APP_CONFIG.pollingIntervalMs);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchStats]);

  return { stats, loading, refreshStats: () => fetchStats(false) };
}
