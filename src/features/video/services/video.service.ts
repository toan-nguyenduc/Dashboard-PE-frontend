import httpClient from '../../../services/http.service';
import { API_CONFIG } from '../../../config/api.config';
import { getStatusInfo } from '../../../config/status.config';
import type { ApiResponse, PageResponse } from '../../../types/api.types';
import type {
  Video,
  VideoFilterParams,
  VideoStatusUpdateRequest,
  VideoUpdateRequest,
} from '../../../types/video.types';

// Mock dataset generator for offline preview/testing
const mockVideos: Video[] = Array.from({ length: 328 }, (_, index) => {
  const id = 380 - index;
  const csmMediaId = index < 20 ? (index % 2 === 0 ? -1 : 0) : 16669035 - index * 10;
  const statusCodes = [0, 1, 21, 22, 23, 31, 32, 33, 40, 41, 42, 43, 51, 52, 53, 61, 62, 63, 71, 72, 73];
  const status = statusCodes[index % statusCodes.length];
  const info = getStatusInfo(status);

  return {
    id,
    csmMediaId,
    status,
    statusDescription: info.label,
    statusGroup: info.group,
    originalPath: index % 2 === 0 
      ? `storage/nas/transcode/movies/2026/film_hd_${id}_master.mp4`
      : `s3://viettel-ott-media-origin/vod/series/ep_${id}_4k_dolby.mkv`,
    convertPath: `s3://viettel-ott-output/hls/manifest_${id}/master.m3u8`,
    chunkFolder: `/pe/chunks/job_${id}/`,
    audioPath: `/pe/audio/job_${id}_aac.m4a`,
    subtitlePath: `/pe/subs/job_${id}_vi.vtt`,
    imagePath: `s3://viettel-ott-output/images/poster_${id}.jpg`,
    posterPath: `s3://viettel-ott-output/posters/landscape_${id}.jpg`,
    logo: `s3://viettel-ott-output/watermarks/vtv_hd.png`,
    metaInfo: `{"vmaf_target": 93.5, "codec": "hevc", "preset": "medium", "crf": 21}`,
    duration: 3600 + (index * 123) % 4000,
    priority: (index * 7) % 50,
    resolution: index % 3 === 0 ? '3840x2160' : index % 2 === 0 ? '1920x1080' : '1280x720',
    fileType: index % 2 === 0 ? 1 : 2,
    frameRate: 29.97,
    chunkCount: 120 + (index % 50),
    needEncryption: index % 3 === 0,
    resourceId: index % 3 === 0 ? `DRM_VIETTEL_ASSET_${id}` : null,
    isVmafEvaluated: index % 2 === 0,
    convertServer: `enc-worker-pod-${(index % 8) + 1}`,
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
    modifiedAt: new Date(Date.now() - (index * 1800000) % 86400000).toISOString(),
  };
});

/**
 * Service for video API calls with mock fallback.
 */
export const videoService = {
  /**
   * Get paginated videos with optional filters.
   */
  async getVideos(params?: VideoFilterParams): Promise<PageResponse<Video>> {
    try {
      const response = await httpClient.get<ApiResponse<PageResponse<Video>>>(
        API_CONFIG.endpoints.videos.list,
        { params }
      );
      return response.data.data;
    } catch {
      // Mock fallback
      const page = params?.page ?? 0;
      const size = params?.size ?? 50;
      let filtered = [...mockVideos];

      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.id.toString().includes(q) ||
            (v.csmMediaId && v.csmMediaId.toString().includes(q)) ||
            (v.originalPath && v.originalPath.toLowerCase().includes(q)) ||
            (v.resourceId && v.resourceId.toLowerCase().includes(q))
        );
      }

      if (params?.status !== undefined) {
        filtered = filtered.filter((v) => v.status === params.status);
      }

      if (params?.statusGroup && params.statusGroup !== 'all') {
        filtered = filtered.filter((v) => v.statusGroup === params.statusGroup);
      }

      if (params?.csmMediaId !== undefined) {
        filtered = filtered.filter((v) => v.csmMediaId === params.csmMediaId);
      }

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const content = filtered.slice(page * size, (page + 1) * size);

      return {
        content,
        page,
        size,
        totalElements,
        totalPages,
        last: page >= totalPages - 1,
      };
    }
  },

  /**
   * Get all videos without pagination.
   */
  async getAllVideos(): Promise<Video[]> {
    try {
      const response = await httpClient.get<ApiResponse<Video[]>>(
        API_CONFIG.endpoints.videos.all
      );
      return response.data.data;
    } catch {
      return mockVideos;
    }
  },

  /**
   * Get video detail by ID.
   */
  async getVideoById(id: number): Promise<Video> {
    try {
      const response = await httpClient.get<ApiResponse<Video>>(
        API_CONFIG.endpoints.videos.detail(id)
      );
      return response.data.data;
    } catch {
      const found = mockVideos.find((v) => v.id === id);
      if (found) return found;
      throw new Error('Video not found');
    }
  },

  /**
   * Update video metadata fields.
   */
  async updateVideo(id: number, data: VideoUpdateRequest): Promise<Video> {
    try {
      const response = await httpClient.put<ApiResponse<Video>>(
        API_CONFIG.endpoints.videos.update(id),
        data
      );
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

  /**
   * Update only the status of a video.
   */
  async updateVideoStatus(id: number, status: number): Promise<Video> {
    try {
      const payload: VideoStatusUpdateRequest = { status };
      const response = await httpClient.patch<ApiResponse<Video>>(
        API_CONFIG.endpoints.videos.updateStatus(id),
        payload
      );
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
};
