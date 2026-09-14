import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { VIDEO_STATUS_MAP } from '@/config/status.config';
import type { Video, VideoUpdateRequest } from '@/types/video.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const videoEditSchema = z.object({
  status: z.number().int(),
  priority: z.number().int().min(0).max(100).optional(),
  resolution: z.string().optional(),
  fileType: z.number().int().optional(),
  needEncryption: z.boolean().optional(),
  resourceId: z.string().optional(),
  convertServer: z.string().optional(),
  originalPath: z.string().optional(),
  metaInfo: z.string().optional(),
});

type VideoEditFormValues = z.infer<typeof videoEditSchema>;

interface VideoEditModalProps {
  video: Video | null;
  open: boolean;
  onCancel: () => void;
  onSave: (id: number, values: VideoUpdateRequest) => Promise<unknown>;
}

export function VideoEditModal({
  video,
  open,
  onCancel,
  onSave,
}: VideoEditModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<VideoEditFormValues>({
    resolver: zodResolver(videoEditSchema),
    defaultValues: {
      status: 0,
      priority: 0,
      resolution: '',
      fileType: 1,
      needEncryption: false,
      resourceId: '',
      convertServer: '',
      originalPath: '',
      metaInfo: '',
    },
  });

  const needEncryption = watch('needEncryption');
  const statusValue = watch('status');
  const fileTypeValue = watch('fileType');

  useEffect(() => {
    if (video && open) {
      reset({
        status: video.status,
        priority: video.priority ?? 0,
        resolution: video.resolution || '',
        fileType: video.fileType ?? 1,
        needEncryption: video.needEncryption ?? false,
        resourceId: video.resourceId || '',
        convertServer: video.convertServer || '',
        originalPath: video.originalPath || '',
        metaInfo: video.metaInfo || '',
      });
    }
  }, [video, open, reset]);

  const onSubmit = async (data: VideoEditFormValues) => {
    if (!video) return;
    await onSave(video.id, data as VideoUpdateRequest);
    onCancel();
  };

  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Chỉnh sửa Video #{video.id}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Row 1: Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Trạng thái (Status) <span className="text-destructive">*</span>
              </label>
              <Select
                value={String(statusValue)}
                onValueChange={(val) => setValue('status', Number(val))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VIDEO_STATUS_MAP).map(([code, info]) => (
                    <SelectItem key={code} value={code}>
                      {code} — {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-[11px] text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Độ ưu tiên (Priority 0-100)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                {...register('priority', { valueAsNumber: true })}
                className="h-9"
              />
            </div>
          </div>

          {/* Row 2: Resolution & File Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Độ phân giải (Resolution)
              </label>
              <Input
                placeholder="VD: 1920x1080"
                {...register('resolution')}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Loại lưu trữ (File Type)
              </label>
              <Select
                value={String(fileTypeValue ?? 1)}
                onValueChange={(val) => setValue('fileType', Number(val))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Chọn loại file" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 — NAS Storage</SelectItem>
                  <SelectItem value="2">2 — S3 Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: DRM Toggle & Resource ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center p-3 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <label className="text-xs font-semibold text-foreground cursor-pointer">
                Mã hóa DRM:
              </label>
              <Switch
                checked={needEncryption}
                onCheckedChange={(checked) => setValue('needEncryption', checked)}
              />
            </div>

            <div className="space-y-1">
              <Input
                placeholder="Resource ID / DRM Key"
                disabled={!needEncryption}
                {...register('resourceId')}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Row 4: Original Path */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Đường dẫn file gốc (Original Path)
            </label>
            <Textarea
              rows={2}
              placeholder="Đường dẫn file gốc..."
              {...register('originalPath')}
              className="text-xs font-mono"
            />
          </div>

          {/* Row 5: Meta Info */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Thông tin bổ sung (Meta Info)
            </label>
            <Textarea
              rows={2}
              placeholder="JSON / Metadata..."
              {...register('metaInfo')}
              className="text-xs font-mono"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
