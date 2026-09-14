import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { videoService } from '../services/video.service';
import { APP_CONFIG } from '@/config/app.config';
import type {
  Video,
  VideoFilterParams,
  VideoUpdateRequest,
} from '@/types/video.types';

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(APP_CONFIG.pagination.defaultPageSize);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Omit<VideoFilterParams, 'page' | 'size'>>({
    search: '',
    statusGroup: 'all',
    status: undefined,
    csmMediaId: undefined,
    sortBy: 'id',
    sortDir: 'desc',
  });

  const isMounted = useRef(true);

  const fetchVideos = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await videoService.getVideos({
        page,
        size: pageSize,
        search: filters.search ? filters.search.trim() : undefined,
        statusGroup: filters.statusGroup !== 'all' ? filters.statusGroup : undefined,
        status: filters.status,
        csmMediaId: filters.csmMediaId,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      });

      if (isMounted.current) {
        setVideos(response.content);
        setTotal(response.totalElements);
      }
    } catch {
      if (isMounted.current && !silent) {
        toast.error('Không thể tải danh sách video');
      }
    } finally {
      if (isMounted.current && !silent) {
        setLoading(false);
      }
    }
  }, [page, pageSize, filters]);

  // Initial and reactive fetch
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Auto-polling interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVideos(true);
    }, APP_CONFIG.pollingIntervalMs);

    return () => clearInterval(interval);
  }, [fetchVideos]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0);
  }, []);

  const handleUpdateVideo = useCallback(async (id: number, data: VideoUpdateRequest) => {
    try {
      const updated = await videoService.updateVideo(id, data);
      toast.success(`Đã cập nhật video #${id}`);
      setVideos((prev) => prev.map((v) => (v.id === id ? updated : v)));
      return updated;
    } catch {
      toast.error(`Cập nhật video #${id} thất bại`);
      throw new Error('Update failed');
    }
  }, []);

  const handleUpdateStatus = useCallback(async (id: number, status: number) => {
    try {
      const updated = await videoService.updateVideoStatus(id, status);
      toast.success(`Đã đổi trạng thái video #${id} sang ${status}`);
      setVideos((prev) => prev.map((v) => (v.id === id ? updated : v)));
      return updated;
    } catch {
      toast.error(`Đổi trạng thái video #${id} thất bại`);
      throw new Error('Status update failed');
    }
  }, []);

  return {
    videos,
    total,
    page,
    pageSize,
    loading,
    filters,
    setPage,
    setPageSize,
    setFilters: handleFilterChange,
    updateVideo: handleUpdateVideo,
    updateStatus: handleUpdateStatus,
    refresh: () => fetchVideos(false),
  };
}
