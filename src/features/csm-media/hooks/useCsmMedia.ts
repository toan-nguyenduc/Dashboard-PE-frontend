import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { csmMediaService } from '../services/csm-media.service';
import { APP_CONFIG } from '@/config/app.config';
import type {
  CsmMedia,
  CsmMediaFilterParams,
  ReEncodeRequest,
} from '@/types/csm-media.types';

export function useCsmMedia() {
  const [mediaList, setMediaList] = useState<CsmMedia[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(APP_CONFIG.pagination.defaultPageSize);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Omit<CsmMediaFilterParams, 'page' | 'size'>>({
    search: '',
    status: undefined,
    convertStatus: undefined,
    originUploadStatus: undefined,
    sortBy: 'id',
    sortDir: 'desc',
  });

  const isMounted = useRef(true);

  const fetchMedia = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await csmMediaService.getCsmMediaList({
        page,
        size: pageSize,
        search: filters.search ? filters.search.trim() : undefined,
        status: filters.status,
        convertStatus: filters.convertStatus,
        originUploadStatus: filters.originUploadStatus,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      });

      if (isMounted.current) {
        setMediaList(response.content);
        setTotal(response.totalElements);
      }
    } catch {
      if (isMounted.current && !silent) {
        toast.error('Không thể tải danh sách CSM Media');
      }
    } finally {
      if (isMounted.current && !silent) {
        setLoading(false);
      }
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

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

  const handleReEncode = useCallback(async (id: number, data?: ReEncodeRequest) => {
    try {
      const result = await csmMediaService.reEncode(id, data);
      toast.success(`Đã kích hoạt Re-encode cho Media #${id}!`);
      // Update local state item to convert_status = 100
      setMediaList((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                convertStatus: 100,
                originUploadStatus: 1,
                linkedVideoStatus: 0,
                linkedVideoStatusDescription: 'Chờ convert',
              }
            : m
        )
      );
      return result;
    } catch {
      toast.error(`Kích hoạt Re-encode cho Media #${id} thất bại`);
      throw new Error('Re-encode failed');
    }
  }, []);

  return {
    mediaList,
    total,
    page,
    pageSize,
    loading,
    filters,
    setPage,
    setPageSize,
    setFilters: handleFilterChange,
    triggerReEncode: handleReEncode,
    refresh: () => fetchMedia(false),
  };
}
