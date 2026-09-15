import httpClient from '../../../services/http.service';
import { API_CONFIG } from '../../../config/api.config';
import { getStatusInfo } from '../../../config/status.config';
import type { ApiResponse, PageResponse } from '../../../types/api.types';
import type {
  Video,
  VideoFilterParams,
  VideoStats,
  VideoStatusUpdateRequest,
  VideoUpdateRequest,
} from '../../../types/video.types';

// Mock titles for demonstration
const MOCK_TITLES = [
  'Phim Hoạt Hình Doraemon Tập 1',
  'Thám Tử Lừng Danh Conan Special',
  'Võ Lâm Truyền Kỳ Season 2',
  'Cô Gái Nhà Người Ta Full HD',
  'Running Man Vietnam 2026',
  'VTV News Buổi Sáng',
  'FastChannel Live Stream HD',
  'Bóng Đá Việt Nam vs Thái Lan',
  'Phim Tâm Lý Hàn Quốc Tập 10',
  'Hài Tết 2026 Trọn Bộ',
];

const mockVideos: Video[] = Array.from({ length: 328 }, (_, index) => {
  const id = 380 - index;
  const csmMediaId = index < 5 ? 0 : index < 10 ? -1 : 16669035 - index * 10;
  const statusCodes = [0, 1, 21, 22, 23, 31, 32, 33, 40, 41, 42, 43, 51, 52, 53, 61, 62, 63, 71, 72, 73];
  const status = statusCodes[index % statusCodes.length];
  const info = getStatusInfo(status);
  const title = MOCK_TITLES[index % MOCK_TITLES.length];
  const startTime = new Date(Date.now() - index * 3600000);
  const endTime = new Date(startTime.getTime() + (60 + (index % 120)) * 60000);

  return {
    id,
    csmMediaId,
    status,
    statusDescription: info.label,
    statusGroup: info.group,
    originalPath: index % 2 === 0
      ? `{"bucket":"viettel-ott-nas","path":"/transcode/movies/2026/film_hd_${id}_master.mp4","domain":"https://nas.viettel.vn"}`
      : `{"bucket":"viettel-ott-media-origin","path":"/vod/series/ep_${id}_4k_dolby.mkv","domain":"https://s3.viettel.vn"}`,
    convertPath: `{"bucket":"viettel-ott-output","path":"/hls/manifest_${id}/master.m3u8","domain":"https://cdn.viettel.vn"}`,
    chunkFolder: `/pe/chunks/job_${id}/`,
    audioPath: `/pe/audio/job_${id}_aac.m4a`,
    subtitlePath: `/pe/subs/job_${id}_vi.vtt`,
    imagePath: `s3://viettel-ott-output/images/poster_${id}.jpg`,
    posterPath: `s3://viettel-ott-output/posters/landscape_${id}.jpg`,
    logo: `s3://viettel-ott-output/watermarks/vtv_hd.png`,
    metaInfo: JSON.stringify({ title, vmaf_target: 93.5, codec: index % 3 === 0 ? 'hevc' : 'h264', preset: 'medium', crf: 21, lang: 'vi' }),
    duration: 3600 + (index * 123) % 4000,
    priority: (index * 7) % 10000,
    resolution: index % 3 === 0 ? '3840x2160' : index % 2 === 0 ? '1920x1080' : '1280x720',
    fileType: index % 2 === 0 ? 1 : 2,
    frameRate: 29.97,
    chunkCount: 120 + (index % 50),
    needEncryption: index % 3 === 0,
    resourceId: index % 3 === 0 ? `DRM_VIETTEL_ASSET_${id}` : null,
    isVmafEvaluated: index % 2 === 0,
    convertServer: `enc-worker-pod-${(index % 8) + 1}`,
    filePath: null,
    convertImages: null,
    convertStartTime: startTime.toISOString(),
    convertEndTime: status === 71 || status === 1 ? endTime.toISOString() : null,
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
    modifiedAt: new Date(Date.now() - (index * 1800000) % 86400000).toISOString(),
  };
});

function parseSearchQuery(search: string): { type: 'id' | 'csmid' | 'title'; value: string } {
  const s = search.trim();
  if (s.toLowerCase().startsWith('@id:')) return { type: 'id', value: s.slice(4).trim() };
  if (s.toLowerCase().startsWith('@csmid:')) return { type: 'csmid', value: s.slice(7).trim() };
  return { type: 'title', value: s.toLowerCase() };
}

export const videoService = {
  async getVideos(params?: VideoFilterParams): Promise<PageResponse<Video>> {
    try {
      const response = await httpClient.get<ApiResponse<PageResponse<Video>>>(API_CONFIG.endpoints.videos.list, { params });
      return response.data.data;
    } catch {
      const page = params?.page ?? 0;
      const size = params?.size ?? 50;
      let filtered = [...mockVideos];

      if (params?.search) {
        const parsed = parseSearchQuery(params.search);
        if (parsed.type === 'id') {
          filtered = filtered.filter((v) => v.id.toString() === parsed.value);
        } else if (parsed.type === 'csmid') {
          filtered = filtered.filter((v) => v.csmMediaId.toString() === parsed.value);
        } else {
          filtered = filtered.filter((v) => {
            try { return JSON.parse(v.metaInfo || '{}').title?.toLowerCase().includes(parsed.value); } catch { return false; }
          });
        }
      }

      if (params?.status !== undefined) filtered = filtered.filter((v) => v.status === params.status);
      if (params?.statusGroup && params.statusGroup !== 'all') filtered = filtered.filter((v) => v.statusGroup === params.statusGroup);
      if (params?.csmMediaId !== undefined) filtered = filtered.filter((v) => v.csmMediaId === params.csmMediaId);
      if (params?.fileType !== undefined) filtered = filtered.filter((v) => v.fileType === params.fileType);
      if (params?.resolution) filtered = filtered.filter((v) => v.resolution === params.resolution);
      if (params?.timeRange) {
        const now = new Date();
        filtered = filtered.filter(v => {
          const vDate = new Date(v.convertStartTime || v.createdAt);
          if (params.timeRange === 'today') {
            return vDate.toDateString() === now.toDateString();
          } else if (params.timeRange === '7d') {
            return (now.getTime() - vDate.getTime()) <= 7 * 24 * 3600 * 1000;
          } else if (params.timeRange === '30d') {
            return (now.getTime() - vDate.getTime()) <= 30 * 24 * 3600 * 1000;
          } else if (params.timeRange !== 'all') {
            // Assume custom JSON date range: [start, end]
            try {
              const range = JSON.parse(params.timeRange as string);
              if (Array.isArray(range) && range.length === 2) {
                const start = new Date(range[0]);
                const end = new Date(range[1]);
                return vDate >= start && vDate <= end;
              }
            } catch { /* ignore */ }
          }
          return true;
        });
      }

      if (params?.sortBy) {
        const field = params.sortBy as keyof Video;
        const dir = params.sortDir === 'asc' ? 1 : -1;
        filtered.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (valA < valB) return -1 * dir;
          if (valA > valB) return 1 * dir;
          return 0;
        });
      }

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const content = filtered.slice(page * size, (page + 1) * size);
      return { content, page, size, totalElements, totalPages, first: page === 0, last: page >= totalPages - 1 };
    }
  },

  /**
   * Get system statistics filtered by current search/attribute criteria.
   * Status and statusGroup filters are excluded from breakdown so the 4 cards reflect the search pool.
   */
  async getStats(params?: VideoFilterParams): Promise<VideoStats> {
    try {
      const response = await httpClient.get<ApiResponse<VideoStats>>(`${API_CONFIG.endpoints.videos.list}/stats`, { params });
      return response.data.data;
    } catch {
      let filtered = [...mockVideos];

      if (params?.search) {
        const parsed = parseSearchQuery(params.search);
        if (parsed.type === 'id') {
          filtered = filtered.filter((v) => v.id.toString() === parsed.value);
        } else if (parsed.type === 'csmid') {
          filtered = filtered.filter((v) => v.csmMediaId.toString() === parsed.value);
        } else {
          filtered = filtered.filter((v) => {
            try { return JSON.parse(v.metaInfo || '{}').title?.toLowerCase().includes(parsed.value); } catch { return false; }
          });
        }
      }

      if (params?.csmMediaId !== undefined) filtered = filtered.filter((v) => v.csmMediaId === params.csmMediaId);
      if (params?.fileType !== undefined) filtered = filtered.filter((v) => v.fileType === params.fileType);
      if (params?.resolution) filtered = filtered.filter((v) => v.resolution === params.resolution);
      if (params?.convertServer) filtered = filtered.filter((v) => v.convertServer?.toLowerCase().includes(params.convertServer!.toLowerCase()));

      if (params?.timeRange) {
        const now = new Date();
        filtered = filtered.filter(v => {
          const vDate = new Date(v.convertStartTime || v.createdAt);
          if (params.timeRange === 'today') {
            return vDate.toDateString() === now.toDateString();
          } else if (params.timeRange === '7d') {
            return (now.getTime() - vDate.getTime()) <= 7 * 24 * 3600 * 1000;
          } else if (params.timeRange === '30d') {
            return (now.getTime() - vDate.getTime()) <= 30 * 24 * 3600 * 1000;
          } else if (params.timeRange !== 'all') {
            try {
              const range = JSON.parse(params.timeRange as string);
              if (Array.isArray(range) && range.length === 2) {
                const start = new Date(range[0]);
                const end = new Date(range[1]);
                return vDate >= start && vDate <= end;
              }
            } catch { /* ignore */ }
          }
          return true;
        });
      }

      const stats = { total: filtered.length, processing: 0, failed: 0, success: 0 };

      filtered.forEach((v) => {
        if (v.statusGroup === 'success') stats.success++;
        else if (v.statusGroup === 'failed') stats.failed++;
        else stats.processing++;
      });
      return stats;
    }
  },

  async getVideoById(id: number): Promise<Video> {
    try {
      const response = await httpClient.get<ApiResponse<Video>>(API_CONFIG.endpoints.videos.detail(id));
      return response.data.data;
    } catch {
      const found = mockVideos.find((v) => v.id === id);
      if (found) return { ...found };
      throw new Error('Video not found');
    }
  },

  async updateVideo(id: number, data: VideoUpdateRequest): Promise<Video> {
    try {
      const response = await httpClient.put<ApiResponse<Video>>(API_CONFIG.endpoints.videos.update(id), data);
      return response.data.data;
    } catch {
      const item = mockVideos.find((v) => v.id === id);
      if (item) {
        Object.assign(item, data, {
          modifiedAt: new Date().toISOString(),
          statusDescription: data.status !== undefined ? getStatusInfo(data.status).label : item.statusDescription,
          statusGroup: data.status !== undefined ? getStatusInfo(data.status).group : item.statusGroup,
        });
        return { ...item };
      }
      throw new Error('Video not found');
    }
  },

  async updateVideoStatus(id: number, status: number): Promise<Video> {
    try {
      const payload: VideoStatusUpdateRequest = { status };
      const response = await httpClient.patch<ApiResponse<Video>>(API_CONFIG.endpoints.videos.updateStatus(id), payload);
      return response.data.data;
    } catch {
      const item = mockVideos.find((v) => v.id === id);
      if (item) {
        item.status = status;
        item.statusDescription = getStatusInfo(status).label;
        item.statusGroup = getStatusInfo(status).group;
        item.modifiedAt = new Date().toISOString();
        return { ...item };
      }
      throw new Error('Video not found');
    }
  },

  /**
   * Trigger reconvert for a video.
   * TODO(backend): Implement POST /api/videos/{id}/reconvert.
   *   - status NOT IN (1,71): update status=31 (re-verify).
   *   - status IN (1,71): update csm_media (status=5, convert_status=100, original_upload_status=1).
   */
  async reconvertVideo(id: number): Promise<Video> {
    try {
      const response = await httpClient.post<ApiResponse<Video>>(`${API_CONFIG.endpoints.videos.detail(id)}/reconvert`);
      return response.data.data;
    } catch {
      const item = mockVideos.find((v) => v.id === id);
      if (item) {
        item.status = 31;
        item.statusDescription = getStatusInfo(31).label;
        item.statusGroup = getStatusInfo(31).group;
        item.modifiedAt = new Date().toISOString();
        return { ...item };
      }
      throw new Error('Video not found');
    }
  },
};
