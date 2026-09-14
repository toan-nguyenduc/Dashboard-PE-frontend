import { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { StatusTag } from './StatusTag';
import { VIDEO_STATUS_MAP } from '@/config/status.config';
import type { Video } from '@/types/video.types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface VideoDetailDrawerProps {
  video: Video | null;
  open: boolean;
  onClose: () => void;
  onEdit: (video: Video) => void;
  onUpdateStatus: (id: number, status: number) => Promise<unknown>;
}

function getPipelineStepInfo(status: number) {
  let currentStep = 0;
  let stepStatus: 'process' | 'finish' | 'error' | 'wait' = 'wait';

  if (status === 0) {
    currentStep = 0;
    stepStatus = 'wait';
  } else if (status === 1 || status === 71) {
    currentStep = 5;
    stepStatus = 'finish';
  } else if (status >= 21 && status <= 24) {
    currentStep = 0;
    stepStatus = status === 21 ? 'finish' : status === 22 ? 'process' : 'error';
  } else if (status >= 31 && status <= 34) {
    currentStep = 1;
    stepStatus = status === 31 ? 'finish' : status === 32 ? 'process' : 'error';
  } else if (status >= 40 && status <= 44) {
    currentStep = 2;
    stepStatus = status === 41 ? 'finish' : status === 42 ? 'process' : status === 40 ? 'wait' : 'error';
  } else if (status >= 51 && status <= 54) {
    currentStep = 3;
    stepStatus = status === 51 ? 'finish' : status === 52 ? 'process' : 'error';
  } else if (status >= 61 && status <= 64) {
    currentStep = 4;
    stepStatus = status === 61 ? 'finish' : status === 62 ? 'process' : 'error';
  } else if (status >= 72 && status <= 74) {
    currentStep = 5;
    stepStatus = status === 72 ? 'process' : 'error';
  }

  return { currentStep, stepStatus };
}

export function VideoDetailDrawer({
  video,
  open,
  onClose,
  onEdit,
  onUpdateStatus,
}: VideoDetailDrawerProps) {
  const [quickStatus, setQuickStatus] = useState<string>('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (!video) return null;

  const { currentStep, stepStatus } = getPipelineStepInfo(video.status);

  const pipelineSteps = [
    { title: 'Download', code: '2x' },
    { title: 'Verify', code: '3x' },
    { title: 'Split', code: '4x' },
    { title: 'Transcode', code: '5x' },
    { title: 'Package', code: '6x' },
    { title: 'Upload', code: '7x' },
  ];

  const handleQuickStatusSubmit = async () => {
    if (!quickStatus) return;
    setStatusLoading(true);
    try {
      await onUpdateStatus(video.id, Number(quickStatus));
      setConfirmDialogOpen(false);
      setQuickStatus('');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCopy = (text?: string | null, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label || 'đường dẫn'} vào clipboard!`);
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '—';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s (${seconds}s)`;
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl p-6 flex flex-col gap-6">
        {/* Header */}
        <SheetHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-xl font-bold font-mono">
                Video #{video.id}
              </SheetTitle>
              <StatusTag status={video.status} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => onEdit(video)}
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Pipeline Stepper 6 Steps */}
          <div className="bg-muted/30 border border-border rounded-xl p-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Tiến độ quy trình Transcode (Pipeline):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {pipelineSteps.map((step, idx) => {
                let stepState = 'wait';
                if (idx < currentStep) stepState = 'finish';
                else if (idx === currentStep) stepState = stepStatus;

                return (
                  <div
                    key={step.title}
                    className={cn(
                      'p-2.5 rounded-lg border text-center transition-all flex flex-col justify-between',
                      stepState === 'finish' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
                      stepState === 'process' && 'bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-400 animate-pulse',
                      stepState === 'error' && 'bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-400 font-bold',
                      stepState === 'wait' && 'bg-muted/40 border-border text-muted-foreground'
                    )}
                  >
                    <div className="text-[10px] font-mono opacity-70 mb-1">
                      Bước {idx + 1} ({step.code})
                    </div>
                    <div className="font-semibold text-xs truncate">
                      {step.title}
                    </div>
                    <div className="text-[10px] mt-1 font-medium">
                      {stepState === 'finish' && '✓ Xong'}
                      {stepState === 'process' && '● Đang chạy'}
                      {stepState === 'error' && '✕ Thất bại'}
                      {stepState === 'wait' && '○ Chờ'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Status Update Bar */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Đổi trạng thái nhanh:</span>
              <Select value={quickStatus} onValueChange={setQuickStatus}>
                <SelectTrigger className="h-8 w-56 text-xs">
                  <SelectValue placeholder="Chọn trạng thái mới" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VIDEO_STATUS_MAP).map(([code, info]) => (
                    <SelectItem key={code} value={code}>
                      {code} — {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="sm"
              disabled={!quickStatus || statusLoading}
              onClick={() => setConfirmDialogOpen(true)}
              className="h-8 text-xs font-medium self-end sm:self-auto"
            >
              Cập nhật
            </Button>
          </div>

          {/* Core Metadata Grid */}
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="p-3 bg-muted/40 border-b border-border">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Thông tin tổng quan
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="divide-y divide-border text-xs">
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Video ID</span>
                  <span className="font-mono font-bold text-primary">#{video.id}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">CSM Media ID</span>
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                    {video.csmMediaId ?? '—'} {video.csmMediaId && video.csmMediaId <= 0 ? '(Nội bộ / Test)' : ''}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Độ ưu tiên (Priority)</span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                    {video.priority ?? 0}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Độ phân giải</span>
                  <span className="font-medium text-foreground">{video.resolution || '—'}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Thời lượng</span>
                  <span className="text-foreground">{formatDuration(video.duration)}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Framerate</span>
                  <span className="font-mono text-foreground">{video.frameRate ? `${video.frameRate} fps` : '—'}</span>
                </div>
              </div>

              <div className="divide-y divide-border text-xs">
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Mã hóa DRM</span>
                  <span className={cn('font-semibold', video.needEncryption ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
                    {video.needEncryption ? 'Có (DRM)' : 'Không'}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Resource ID</span>
                  <span className="font-mono text-foreground">{video.resourceId || '—'}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Loại file</span>
                  <span className="text-foreground">
                    {video.fileType === 1 ? 'NAS Storage (1)' : video.fileType === 2 ? 'S3 Storage (2)' : video.fileType ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Số segment</span>
                  <span className="font-mono text-foreground">{video.chunkCount ?? '—'}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Ngày tạo</span>
                  <span className="font-mono text-muted-foreground">
                    {video.createdAt ? dayjs(video.createdAt).format('YYYY-MM-DD HH:mm:ss') : '—'}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="font-semibold text-muted-foreground">Cập nhật</span>
                  <span className="font-mono text-muted-foreground">
                    {video.modifiedAt ? dayjs(video.modifiedAt).format('YYYY-MM-DD HH:mm:ss') : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* File Paths & Storage */}
          <div className="border border-border rounded-xl overflow-hidden bg-card divide-y divide-border">
            <div className="p-3 bg-muted/40 border-b border-border">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Đường dẫn file & Lưu trữ
              </h4>
            </div>

            <div className="p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Đường dẫn file gốc (Original):</span>
                {video.originalPath && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => handleCopy(video.originalPath, 'đường dẫn gốc')}
                  >
                    Copy
                  </Button>
                )}
              </div>
              <div className="p-2 rounded bg-muted font-mono text-xs text-foreground break-all select-all">
                {video.originalPath || '—'}
              </div>
            </div>

            <div className="p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Đường dẫn convert (Output):</span>
                {video.convertPath && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => handleCopy(video.convertPath, 'đường dẫn convert')}
                  >
                    Copy
                  </Button>
                )}
              </div>
              <div className="p-2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs break-all select-all border border-emerald-500/20">
                {video.convertPath || '—'}
              </div>
            </div>

            {video.metaInfo && (
              <div className="p-3 text-xs space-y-1">
                <span className="font-semibold text-muted-foreground">Meta Info:</span>
                <div className="p-2 rounded bg-muted font-mono text-[11px] text-foreground break-all">
                  {video.metaInfo}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>

      {/* Confirmation Dialog for Quick Status Update */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận đổi trạng thái</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đổi trạng thái của video #{video.id} sang mã{' '}
              <strong>{quickStatus}</strong> không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleQuickStatusSubmit} disabled={statusLoading}>
              {statusLoading ? 'Đang cập nhật...' : 'Đồng ý'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
