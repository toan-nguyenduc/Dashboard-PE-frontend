/**
 * Video entity and DTO types matching backend definitions.
 */

export interface Video {
  id: number;
  csmMediaId: number;
  priority: number | null;
  metaInfo: string | null;
  originalPath: string | null;
  convertPath: string | null;
  resolution: string | null;
  duration: number | null;
  frameRate: number | null;
  chunkCount: number | null;
  filePath: string | null;
  logo: string | null;
  imagePath: string | null;
  posterPath: string | null;
  convertImages: string | null;
  convertStartTime: string | null;
  convertEndTime: string | null;
  needEncryption: boolean | null;
  resourceId: string | null;
  audioPath: string | null;
  subtitlePath: string | null;
  chunkFolder: string | null;
  fileType: number | null;
  status: number;
  statusDescription: string;
  statusGroup: string;
  isVmafEvaluated: boolean | null;
  convertServer: number | null;
  createdAt: string;
  modifiedAt: string;
}

export interface VideoUpdateRequest {
  priority?: number;
  resolution?: string;
  needEncryption?: boolean;
  resourceId?: string;
  originalPath?: string;
  metaInfo?: string;
  fileType?: number;
  status?: number;
  convertServer?: number;
}

export interface VideoStatusUpdateRequest {
  status: number;
}

export interface VideoFilterParams {
  page?: number;
  size?: number;
  search?: string;
  status?: number;
  statusGroup?: string;
  csmMediaId?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
