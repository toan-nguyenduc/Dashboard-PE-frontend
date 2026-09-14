/**
 * CSM Media entity and DTO types matching backend definitions.
 */

export interface CsmMedia {
  id: number;
  name: string;
  slug: string | null;
  shortDesc: string | null;
  description: string | null;
  status: number | null;
  duration: number | null;
  resolution: string | null;
  originalPath: string | null;
  imagePath: string | null;
  posterPath: string | null;
  fileType: number | null;
  convertStatus: number | null;
  convertPath: string | null;
  convertPriority: number | null;
  convertStartTime: string | null;
  convertEndTime: string | null;
  convertImages: string | null;
  metaInfo: string | null;
  needEncryption: boolean | null;
  resourceId: string | null;
  audioPath: string | null;
  subtitlePath: string | null;
  originUploadStatus: number | null;
  createdAt: string | null;
  updatedAt: string | null;

  // Linked Video in PE system
  linkedVideoId: number | null;
  linkedVideoStatus: number | null;
  linkedVideoStatusDescription: string | null;
}

export interface CsmMediaFilterParams {
  page?: number;
  size?: number;
  search?: string;
  status?: number;
  convertStatus?: number;
  originUploadStatus?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ReEncodeRequest {
  priority?: number;
  needEncryption?: boolean;
  resourceId?: string;
}

export interface ReEncodeResponse {
  csmMediaId: number;
  mediaName: string;
  convertStatus: number;
  originUploadStatus: number;
  videoId: number;
  videoStatus: number;
  message: string;
  triggeredAt: string;
}
