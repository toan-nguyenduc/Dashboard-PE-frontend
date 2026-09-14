import httpClient from '../../../services/http.service';
import { API_CONFIG } from '../../../config/api.config';
import type { ApiResponse, PageResponse } from '../../../types/api.types';
import type {
  CsmMedia,
  CsmMediaFilterParams,
  ReEncodeRequest,
  ReEncodeResponse,
} from '../../../types/csm-media.types';

const mockMediaList: CsmMedia[] = Array.from({ length: 3798 }, (_, index) => {
  const id = 16669035 - index * 10;
  const hasLinkedVideo = index % 4 !== 0;
  const linkedVideoId = hasLinkedVideo ? 380 - index : null;
  const convertStatuses = [100, 1, 24, 34, 44, 54, 64, 74];
  const convertStatus = convertStatuses[index % convertStatuses.length];

  return {
    id,
    name: `Phim Hành Động Chiếu Rạp 2026 - Tập ${(index % 24) + 1} [Bản Gốc 4K Master]`,
    slug: `phim-hanh-dong-tap-${(index % 24) + 1}`,
    shortDesc: null,
    description: null,
    originalPath: `storage/nas/csm/media/2026/phim_hd_${id}_master.mp4`,
    convertPath: convertStatus === 1 ? `s3://viettel-ott-output/csm/${id}/manifest.m3u8` : null,
    audioPath: `/pe/audio/${id}.m4a`,
    subtitlePath: `/pe/subs/${id}.vtt`,
    posterPath: `s3://viettel-ott-output/posters/${id}.jpg`,
    imagePath: `s3://viettel-ott-output/thumbs/${id}.jpg`,
    convertImages: `{"thumb_1": "img1.jpg", "thumb_2": "img2.jpg"}`,
    duration: 5400 + (index * 97) % 3600,
    status: 5,
    convertStatus,
    originUploadStatus: 1,
    convertPriority: (index * 13) % 100,
    fileType: index % 2 === 0 ? 1 : 2,
    needEncryption: index % 3 === 0,
    resourceId: index % 3 === 0 ? `DRM_ASSET_CSM_${id}` : null,
    resolution: index % 3 === 0 ? '3840x2160' : '1920x1080',
    metaInfo: `{"aspect_ratio": "16:9", "fps": 29.97}`,
    createdAt: new Date(Date.now() - index * 7200000).toISOString(),
    updatedAt: new Date(Date.now() - (index * 3600000) % 86400000).toISOString(),
    convertStartTime: null,
    convertEndTime: null,
    linkedVideoId,
    linkedVideoStatus: hasLinkedVideo ? (convertStatus === 1 ? 71 : convertStatus === 100 ? 0 : convertStatus - 1) : null,
    linkedVideoStatusDescription: hasLinkedVideo 
      ? (convertStatus === 1 ? 'Upload thành công' : convertStatus === 100 ? 'Chờ convert' : 'Thất bại')
      : null,
  };
});

/**
 * Service for CSM Media API calls with mock fallback.
 */
export const csmMediaService = {
  /**
   * Get paginated CSM Media items with optional search and filters.
   */
  async getCsmMediaList(params?: CsmMediaFilterParams): Promise<PageResponse<CsmMedia>> {
    try {
      const response = await httpClient.get<ApiResponse<PageResponse<CsmMedia>>>(
        API_CONFIG.endpoints.csmMedia.list,
        { params }
      );
      return response.data.data;
    } catch {
      const page = params?.page ?? 0;
      const size = params?.size ?? 50;
      let filtered = [...mockMediaList];

      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.id.toString().includes(q) ||
            (m.name && m.name.toLowerCase().includes(q)) ||
            (m.originalPath && m.originalPath.toLowerCase().includes(q))
        );
      }

      if (params?.convertStatus !== undefined) {
        filtered = filtered.filter((m) => m.convertStatus === params.convertStatus);
      }

      if (params?.originUploadStatus !== undefined) {
        filtered = filtered.filter((m) => m.originUploadStatus === params.originUploadStatus);
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
        first: page === 0,
        last: page >= totalPages - 1,
      };
    }
  },

  /**
   * Get detail of a single CSM Media item by ID.
   */
  async getCsmMediaById(id: number): Promise<CsmMedia> {
    try {
      const response = await httpClient.get<ApiResponse<CsmMedia>>(
        API_CONFIG.endpoints.csmMedia.detail(id)
      );
      return response.data.data;
    } catch {
      const found = mockMediaList.find((m) => m.id === id);
      if (found) return found;
      throw new Error('Media not found');
    }
  },

  /**
   * Trigger re-encode for a CSM Media item.
   */
  async reEncode(id: number, data?: ReEncodeRequest): Promise<ReEncodeResponse> {
    try {
      const response = await httpClient.post<ApiResponse<ReEncodeResponse>>(
        API_CONFIG.endpoints.csmMedia.reEncode(id),
        data || {}
      );
      return response.data.data;
    } catch {
      const item = mockMediaList.find((m) => m.id === id);
      if (item) {
        item.convertStatus = 100;
        item.originUploadStatus = 1;
        item.linkedVideoStatus = 0;
        item.linkedVideoStatusDescription = 'Chờ convert';
        if (data?.priority !== undefined) item.convertPriority = data.priority;
        if (data?.needEncryption !== undefined) item.needEncryption = data.needEncryption;
        if (data?.resourceId !== undefined) item.resourceId = data.resourceId;
      }
      return {
        csmMediaId: id,
        mediaName: item?.name ?? `Media ${id}`,
        convertStatus: 100,
        originUploadStatus: 1,
        videoId: item?.linkedVideoId ?? 999,
        videoStatus: 0,
        message: 'Re-encode triggered successfully (mock)',
        triggeredAt: new Date().toISOString(),
      };
    }
  },
};
