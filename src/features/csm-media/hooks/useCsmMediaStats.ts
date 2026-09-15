import { useState, useEffect, useRef, useCallback } from 'react';
import { csmMediaService } from '../services/csm-media.service';
import type { CsmMediaFilterParams } from '@/types/csm-media.types';
import { APP_CONFIG } from '@/config/app.config';

export function useCsmMediaStats(filters?: Partial<CsmMediaFilterParams>) {
  const [stats, setStats] = useState({ total: 0, waitingConvert: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await csmMediaService.getStats({
        search: filters?.search ? filters.search.trim() : undefined,
        originUploadStatus: filters?.originUploadStatus,
      });
      if (isMounted.current) setStats(data);
    } finally {
      if (isMounted.current && !silent) setLoading(false);
    }
  }, [filters?.search, filters?.originUploadStatus]);

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
