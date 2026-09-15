import { Drawer, Descriptions, Button, Tooltip, Tag } from 'antd';
import type { CsmMedia } from '@/types/csm-media.types';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import dayjs from 'dayjs';

interface CsmMediaDetailDrawerProps {
  visible: boolean;
  media: CsmMedia | null;
  onClose: () => void;
  onReEncode?: (media: CsmMedia) => void;
}

function cleanVal(v?: unknown): string {
  if (v === null || v === undefined) return '';
  const str = String(v).trim();
  if (['None', 'none', '—', '-', '_', 'null', 'undefined'].includes(str)) return '';
  return str;
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

function ConvertStatusTag({ status }: { status: number | null }) {
  if (status === null || status === undefined) return <span className="text-muted-foreground">-</span>;
  if (status === 1) return <Tag color="success">Thành công (1)</Tag>;
  if (status === 100) return <Tag color="warning">Chờ convert (100)</Tag>;
  return <Tag color="error">Lỗi ({status})</Tag>;
}

export function CsmMediaDetailDrawer({ visible, media, onClose, onReEncode }: CsmMediaDetailDrawerProps) {
  if (!media) return null;

  const meta = extractMeta(media.metaInfo);

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between pr-4">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold">Chi tiết CSM Media #{media.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <ConvertStatusTag status={media.convertStatus} />
            {onReEncode && (
              <Button 
                type="primary" 
                size="small" 
                icon={<RefreshCw size={14} />}
                onClick={() => onReEncode(media)}
              >
                Re-encode
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
          <Descriptions.Item label="CSM ID">
            <span className="font-mono font-medium">#{media.id}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái Publish">
            <span className="font-medium text-foreground">{media.status ?? 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Tên (Name)" span={2}>
            <span className="font-medium text-foreground">{cleanVal(media.name) || 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Slug" span={2}>
            <span className="font-medium text-muted-foreground">{cleanVal(media.slug) || 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả ngắn" span={2}>
            {cleanVal(media.shortDesc) || 'N/A'}
          </Descriptions.Item>
        </Descriptions>

        {/* 2. Chất lượng */}
        <SectionTitle title="Chất lượng" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="Độ phân giải">{cleanVal(media.resolution) || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Frame Rate">{meta.fps ? `${meta.fps} fps` : 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Aspect Ratio">{cleanVal(meta.aspect_ratio) || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="AI Review Status">
            {media.aiReviewStatus === 1 ? <Tag color="success">Đã duyệt</Tag> : <Tag color="default">Chưa duyệt</Tag>}
          </Descriptions.Item>
        </Descriptions>

        {/* 3. Thông số kỹ thuật */}
        <SectionTitle title="Thông số kỹ thuật" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="Loại File (Type)">
            {media.fileType === 1 ? 'NAS (1)' : media.fileType === 2 ? 'S3 (2)' : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Thời lượng (Duration)">{media.duration ? `${media.duration}s` : 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Video Liên kết (PE ID)">
            {media.linkedVideoId ? (
              <span className="font-mono text-primary cursor-pointer hover:underline">#{media.linkedVideoId}</span>
            ) : (
              <span className="text-muted-foreground">Không có</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="TT Video Liên kết">
            <Tag color={media.linkedVideoStatus === 71 ? 'success' : media.linkedVideoStatus === 0 ? 'warning' : 'default'}>
              {media.linkedVideoStatusDescription || 'N/A'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {/* 4. Tài nguyên Media */}
        <SectionTitle title="Tài nguyên Media" />
        <div className="space-y-3 bg-card border border-border p-3 rounded-lg text-sm">
          <div>
            <div className="font-semibold text-muted-foreground mb-1 flex items-center">
              Original Path <CopyBtn value={cleanVal(media.originalPath)} label="Original Path" />
            </div>
            <div className="bg-muted p-2 rounded break-all font-mono text-xs select-all">
              {cleanVal(media.originalPath) || 'N/A'}
            </div>
          </div>
          <div>
            <div className="font-semibold text-muted-foreground mb-1 flex items-center">
              Convert Path (HLS/DASH) <CopyBtn value={cleanVal(media.convertPath)} label="Convert Path" />
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-2 rounded break-all font-mono text-xs select-all">
              {cleanVal(media.convertPath) || 'N/A'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-semibold text-muted-foreground mb-1 flex items-center">
                Audio Path <CopyBtn value={cleanVal(media.audioPath)} label="Audio Path" />
              </div>
              <div className="bg-muted p-2 rounded break-all font-mono text-xs h-16 overflow-y-auto">
                {cleanVal(media.audioPath) || 'N/A'}
              </div>
            </div>
            <div>
              <div className="font-semibold text-muted-foreground mb-1 flex items-center">
                Subtitle Path <CopyBtn value={cleanVal(media.subtitlePath)} label="Subtitle Path" />
              </div>
              <div className="bg-muted p-2 rounded break-all font-mono text-xs h-16 overflow-y-auto">
                {cleanVal(media.subtitlePath) || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Trạng thái xử lý */}
        <SectionTitle title="Trạng thái xử lý" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="Convert Status">
            <ConvertStatusTag status={media.convertStatus} />
          </Descriptions.Item>
          <Descriptions.Item label="Origin Upload Status">
            <Tag color={media.originUploadStatus === 1 ? 'success' : 'default'}>{media.originUploadStatus ?? 'N/A'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Bắt đầu Convert">
            <span className="font-mono text-xs">{media.convertStartTime ? dayjs(media.convertStartTime).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Kết thúc Convert">
            <span className="font-mono text-xs">{media.convertEndTime ? dayjs(media.convertEndTime).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            <span className="font-mono text-xs text-muted-foreground">{media.createdAt ? dayjs(media.createdAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật cuối">
            <span className="font-mono text-xs text-muted-foreground">{media.updatedAt ? dayjs(media.updatedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</span>
          </Descriptions.Item>
        </Descriptions>

        {/* 6. Nội dung & Hình ảnh */}
        <SectionTitle title="Nội dung & Hình ảnh" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-card border border-border p-3 rounded-lg text-sm">
            <div className="font-semibold text-muted-foreground mb-1 flex items-center">
              Image Path <CopyBtn value={cleanVal(media.imagePath)} label="Image Path" />
            </div>
            <div className="bg-muted p-2 rounded break-all font-mono text-xs truncate">
              {cleanVal(media.imagePath) || 'N/A'}
            </div>
          </div>
          <div className="bg-card border border-border p-3 rounded-lg text-sm">
            <div className="font-semibold text-muted-foreground mb-1 flex items-center">
              Poster Path <CopyBtn value={cleanVal(media.posterPath)} label="Poster Path" />
            </div>
            <div className="bg-muted p-2 rounded break-all font-mono text-xs truncate">
              {cleanVal(media.posterPath) || 'N/A'}
            </div>
          </div>
        </div>
        <Descriptions column={1} size="small" bordered className="bg-card">
          <Descriptions.Item label={
            <div className="flex items-center justify-between">
              <span>Meta Info Raw</span>
              <CopyBtn value={cleanVal(media.metaInfo)} label="Meta Info" />
            </div>
          }>
            <pre className="m-0 p-2 bg-muted rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
              {cleanVal(media.metaInfo) ? JSON.stringify(meta, null, 2) : 'N/A'}
            </pre>
          </Descriptions.Item>
        </Descriptions>

        {/* 7. Bảo mật & DRM */}
        <SectionTitle title="Bảo mật & DRM" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="Mã hóa DRM">
            {media.needEncryption ? <Tag color="warning">Có (DRM)</Tag> : <span className="text-muted-foreground">Không</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Resource ID">
            <span className="font-mono text-xs">{cleanVal(media.resourceId) || 'N/A'}</span>
          </Descriptions.Item>
        </Descriptions>

        {/* 8. Thông tin hệ thống */}
        <SectionTitle title="Thông tin hệ thống" />
        <Descriptions column={2} size="small" bordered className="bg-card">
          <Descriptions.Item label="Mức độ ưu tiên (Priority)">
            <span className="font-bold text-amber-600">{media.convertPriority ?? 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Convert Images JSON">
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] inline-block">{cleanVal(media.convertImages) || 'N/A'}</span>
            <CopyBtn value={cleanVal(media.convertImages)} label="Convert Images JSON" />
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Drawer>
  );
}
