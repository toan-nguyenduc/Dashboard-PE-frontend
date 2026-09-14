import dayjs from 'dayjs';
import { toast } from 'sonner';
import type { CsmMedia } from '@/types/csm-media.types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface CsmMediaDetailDrawerProps {
  visible: boolean;
  media: CsmMedia | null;
  onClose: () => void;
  onReEncode: (media: CsmMedia) => void;
}

export function CsmMediaDetailDrawer({
  visible,
  media,
  onClose,
  onReEncode,
}: CsmMediaDetailDrawerProps) {
  if (!media) return null;

  const handleCopy = (text?: string | null, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label || 'đường dẫn'} vào clipboard!`);
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Sheet open={visible} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl p-6 flex flex-col gap-6">
        {/* Header */}
        <SheetHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-xl font-bold font-mono">
                CSM Media #{media.id}
              </SheetTitle>
              <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
                {media.name}
              </p>
            </div>
            <Button
              size="sm"
              className="h-8 text-xs font-semibold shrink-0"
              onClick={() => onReEncode(media)}
            >
              Kích hoạt Re-encode
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Linked PE Video Card */}
          <div className="bg-muted/40 border border-border rounded-xl p-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
              Video PE trong hệ thống Transcode:
            </h4>
            {media.linkedVideoId ? (
              <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Video ID:</span>
                  <span className="font-mono font-bold text-primary">#{media.linkedVideoId}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span className="font-semibold text-foreground">
                    {media.linkedVideoStatusDescription || `Status ${media.linkedVideoStatus}`}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Chưa có video tương ứng trong bảng `video` của PE (sẽ tự động tạo khi Video-Connector quét).
              </p>
            )}
          </div>

          {/* Core Metadata Grid */}
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="p-3 bg-muted/40 border-b border-border">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Thông tin Media (Kho CSM)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="divide-y divide-border text-xs">
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">CSM ID</span>
                  <span className="font-mono font-bold text-primary">#{media.id}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Convert Priority</span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                    {media.convertPriority ?? 0}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Convert Status</span>
                  <span className="font-mono text-foreground">{media.convertStatus ?? '—'}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Origin Upload Status</span>
                  <span className="font-mono text-foreground">{media.originUploadStatus ?? '—'}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Độ phân giải</span>
                  <span className="font-medium text-foreground">{media.resolution || '—'}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Thời lượng</span>
                  <span className="text-foreground">{formatDuration(media.duration)}</span>
                </div>
              </div>

              <div className="divide-y divide-border text-xs">
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Mã hóa DRM</span>
                  <span className={cn('font-semibold', media.needEncryption ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
                    {media.needEncryption ? 'Có (DRM)' : 'Không'}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Resource ID</span>
                  <span className="font-mono text-foreground">{media.resourceId || '—'}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Slug</span>
                  <span className="font-mono text-foreground truncate max-w-[180px]">{media.slug || '—'}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Loại lưu trữ</span>
                  <span className="text-foreground">
                    {media.fileType === 1 ? 'NAS Storage (1)' : media.fileType === 2 ? 'S3 Storage (2)' : media.fileType ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Ngày tạo</span>
                  <span className="font-mono text-muted-foreground">
                    {media.createdAt ? dayjs(media.createdAt).format('YYYY-MM-DD HH:mm:ss') : '—'}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Cập nhật</span>
                  <span className="font-mono text-muted-foreground">
                    {media.updatedAt ? dayjs(media.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Paths Grid */}
          <div className="border border-border rounded-xl overflow-hidden bg-card divide-y divide-border">
            <div className="p-3 bg-muted/40 border-b border-border">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Đường dẫn file & Lưu trữ
              </h4>
            </div>

            <div className="p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Đường dẫn gốc (Original):</span>
                {media.originalPath && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => handleCopy(media.originalPath, 'đường dẫn gốc')}
                  >
                    Copy
                  </Button>
                )}
              </div>
              <div className="p-2 rounded bg-muted font-mono text-xs text-foreground break-all select-all">
                {media.originalPath || '—'}
              </div>
            </div>

            <div className="p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Đường dẫn convert (Output):</span>
                {media.convertPath && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => handleCopy(media.convertPath, 'đường dẫn convert')}
                  >
                    Copy
                  </Button>
                )}
              </div>
              <div className="p-2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs break-all select-all border border-emerald-500/20">
                {media.convertPath || '—'}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
