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
  convertServer: string | null;
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
  convertServer?: string;
}

export interface VideoStatusUpdateRequest {
  status: number;
}

/** Global statistics for the entire PE system (not per-page). */
export interface VideoStats {
  total: number;
  processing: number;
  failed: number;
  success: number;
}

export interface VideoFilterParams {
  page?: number;
  size?: number;
  /** Supports @id:xxx, @csmid:xxx, or plain video title search */
  search?: string;
  status?: number;
  statusGroup?: string;
  csmMediaId?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  fileType?: number;
  resolution?: string;
  priority?: number;
  convertServer?: string;
  timeRange?: 'today' | '7d' | '30d' | 'all' | string;
}

