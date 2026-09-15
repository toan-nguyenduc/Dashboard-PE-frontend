import { Drawer, Descriptions, Button, Tooltip, Tag } from 'antd';
import type { Video } from '@/types/video.types';
import { canReconvert, isFullSuccess } from '@/config/status.config';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import dayjs from 'dayjs';
import { StatusTag } from './StatusTag';

interface VideoDetailDrawerProps {
  visible: boolean;
  video: Video | null;
  onClose: () => void;
  onReconvert?: (video: Video) => void;
}

function cleanVal(v?: unknown): string {
  if (v === null || v === undefined) return '';
  const str = String(v).trim();
  if (['None', 'none', '—', '-', '_', 'null', 'undefined'].includes(str)) return '';
  return str;
}

function parsePathStr(raw: string | null) {
  const clean = cleanVal(raw);
  if (!clean) return "";
  try {
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === "object") {
      const parts: string[] = [];
      if (cleanVal(parsed.domain)) parts.push(String(parsed.domain).trim().replace(/\/+$/, ''));
      if (cleanVal(parsed.bucket)) parts.push(String(parsed.bucket).trim().replace(/^\/+|\/+$/g, ''));
      if (cleanVal(parsed.path)) parts.push(String(parsed.path).trim().replace(/^\/+/, ''));
      return parts.join("/");
    }
  } catch {}
  return clean;
}

function extractMeta(metaInfo: string | null) {
  const clean = cleanVal(metaInfo);
  if (!clean) return {};
  try {
    return JSON.parse(clean);
  } catch {
    return {};
  }
}

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <Tooltip title={`Copy ${label}`}>
      <span
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="ml-2 inline-flex items-center justify-center rounded text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </span>
    </Tooltip>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 mt-6 pb-2 border-b border-border/50">
      {title}
    </h3>
  );
}

export function VideoDetailDrawer({ visible, video, onClose, onReconvert }: VideoDetailDrawerProps) {
  if (!video) return null;

  const meta = extractMeta(video.metaInfo);
  const originalFull = parsePathStr(video.originalPath);
  const convertFull = parsePathStr(video.convertPath);

  const _canReconvert = canReconvert(video.status);
  const _isSuccess = isFullSuccess(video.status);

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between pr-4">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold">Chi tiết Video #{video.id}</span>
            <span className="text-xs text-muted-foreground font-mono">CSM ID: {video.csmMediaId}</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusTag status={video.status} />
            {onReconvert && (
              <Button 
                type="primary" 
                size="small" 
                icon={<RefreshCw size={14} />}
                disabled={!_canReconvert}
                onClick={() => onReconvert(video)}
              >
                {_isSuccess ? 'Re-encode (CSM)' : 'Re-verify'}
              </Button>
            )}
          </div>
        </div>
      }
      placement="right"
      width={720}
      onClose={onClose}
      open={visible}
      className="dark:bg-[#121212]"
    >
      <div className="space-y-2">
        {/* 1. Thông tin Media */}
        <SectionTitle title="Thông tin Media" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="ID / CSM ID">
            <span className="font-mono font-medium">#{video.id} / {video.csmMediaId}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Tên video">
            <span className="font-medium text-foreground">{cleanVal(meta.title) || 'N/A'}</span>
          </Descriptions.Item>
        </Descriptions>

        {/* 2. Chất lượng */}
        <SectionTitle title="Chất lượng" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="Độ phân giải">{cleanVal(video.resolution) || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Frame Rate">{video.frameRate ? `${video.frameRate} fps` : 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="VMAF Đánh giá">
            {video.isVmafEvaluated ? <Tag color="success">Đã đánh giá</Tag> : <Tag color="default">Chưa đánh giá</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="VMAF Target">{cleanVal(meta.vmaf_target) || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Codec">{cleanVal(meta.codec) || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="CRF">{cleanVal(meta.crf) || 'N/A'}</Descriptions.Item>
        </Descriptions>

        {/* 3. Thông số kỹ thuật */}
        <SectionTitle title="Thông số kỹ thuật" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="File Type">
            {video.fileType === 1 ? 'NAS (1)' : video.fileType === 2 ? 'S3 (2)' : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Số Segment (Chunks)">{video.chunkCount ?? 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Convert Server">
            <span className="font-mono text-xs">{cleanVal(video.convertServer) || 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Preset">{cleanVal(meta.preset) || 'N/A'}</Descriptions.Item>
        </Descriptions>

        {/* 4. Tài nguyên Media */}
        <SectionTitle title="Tài nguyên Media" />
        <div className="space-y-3 bg-card border border-border p-3 rounded-lg text-sm">
          <div>
            <div className="font-semibold text-muted-foreground mb-1 flex items-center">
              Original Path <CopyBtn value={originalFull} label="Original Path" />
            </div>
            <div className="bg-muted p-2 rounded break-all font-mono text-xs select-all">
              {originalFull || 'N/A'}
            </div>
          </div>
          <div>
            <div className="font-semibold text-muted-foreground mb-1 flex items-center">
              Convert Path (HLS/DASH) <CopyBtn value={convertFull} label="Convert Path" />
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-2 rounded break-all font-mono text-xs select-all">
              {convertFull || 'N/A'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-semibold text-muted-foreground mb-1 flex items-center">
                Audio Path <CopyBtn value={cleanVal(video.audioPath)} label="Audio Path" />
              </div>
              <div className="bg-muted p-2 rounded break-all font-mono text-xs h-16 overflow-y-auto">
                {cleanVal(video.audioPath) || 'N/A'}
              </div>
            </div>
            <div>
              <div className="font-semibold text-muted-foreground mb-1 flex items-center">
                Subtitle Path <CopyBtn value={cleanVal(video.subtitlePath)} label="Subtitle Path" />
              </div>
              <div className="bg-muted p-2 rounded break-all font-mono text-xs h-16 overflow-y-auto">
                {cleanVal(video.subtitlePath) || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Trạng thái xử lý */}
        <SectionTitle title="Trạng thái xử lý" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="Trạng thái">
            <StatusTag status={video.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Nhóm">
            <Tag>{video.statusGroup}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Bắt đầu Convert">
            <span className="font-mono text-xs">{video.convertStartTime ? dayjs(video.convertStartTime).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Kết thúc Convert">
            <span className="font-mono text-xs">{video.convertEndTime ? dayjs(video.convertEndTime).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            <span className="font-mono text-xs text-muted-foreground">{video.createdAt ? dayjs(video.createdAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật cuối">
            <span className="font-mono text-xs text-muted-foreground">{video.modifiedAt ? dayjs(video.modifiedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</span>
          </Descriptions.Item>
        </Descriptions>

        {/* 6. Nội dung & Hình ảnh */}
        <SectionTitle title="Nội dung & Hình ảnh" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-card border border-border p-3 rounded-lg text-sm">
            <div className="font-semibold text-muted-foreground mb-1 flex items-center">
              Image Path <CopyBtn value={cleanVal(video.imagePath)} label="Image Path" />
            </div>
            <div className="bg-muted p-2 rounded break-all font-mono text-xs truncate">
              {cleanVal(video.imagePath) || 'N/A'}
            </div>
          </div>
          <div className="bg-card border border-border p-3 rounded-lg text-sm">
            <div className="font-semibold text-muted-foreground mb-1 flex items-center">
              Poster Path <CopyBtn value={cleanVal(video.posterPath)} label="Poster Path" />
            </div>
            <div className="bg-muted p-2 rounded break-all font-mono text-xs truncate">
              {cleanVal(video.posterPath) || 'N/A'}
            </div>
          </div>
        </div>
        <Descriptions column={1} size="small" bordered className="bg-card">
          <Descriptions.Item label={
            <div className="flex items-center justify-between">
              <span>Meta Info Raw</span>
              <CopyBtn value={cleanVal(video.metaInfo)} label="Meta Info" />
            </div>
          }>
            <pre className="m-0 p-2 bg-muted rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
              {cleanVal(video.metaInfo) ? JSON.stringify(meta, null, 2) : 'N/A'}
            </pre>
          </Descriptions.Item>
        </Descriptions>

        {/* 7. Bảo mật & DRM */}
        <SectionTitle title="Bảo mật & DRM" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="Mã hóa DRM">
            {video.needEncryption ? <Tag color="warning">Có (DRM)</Tag> : <span className="text-muted-foreground">Không</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Resource ID">
            <span className="font-mono text-xs">{cleanVal(video.resourceId) || 'N/A'}</span>
          </Descriptions.Item>
        </Descriptions>

        {/* 8. Thông tin hệ thống */}
        <SectionTitle title="Thông tin hệ thống" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="Mức độ ưu tiên (Priority)">
            <span className="font-bold text-amber-600">{video.priority ?? 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Đường dẫn file local (FilePath)">
            <span className="font-mono text-xs text-muted-foreground break-all">{cleanVal(video.filePath) || 'N/A'}</span>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Drawer>
  );
}
