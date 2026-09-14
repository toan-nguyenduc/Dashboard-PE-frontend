import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { CsmMedia, ReEncodeRequest } from '@/types/csm-media.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const reEncodeSchema = z.object({
  priority: z.number().int().min(0).max(10000),
  needEncryption: z.boolean(),
  resourceId: z.string().optional(),
});

type ReEncodeFormValues = z.infer<typeof reEncodeSchema>;

interface ReEncodeModalProps {
  visible: boolean;
  media: CsmMedia | null;
  loading: boolean;
  onConfirm: (id: number, data: ReEncodeRequest) => Promise<void>;
  onCancel: () => void;
}

export function ReEncodeModal({
  visible,
  media,
  loading,
  onConfirm,
  onCancel,
}: ReEncodeModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReEncodeFormValues>({
    resolver: zodResolver(reEncodeSchema),
    defaultValues: {
      priority: 10,
      needEncryption: false,
      resourceId: '',
    },
  });

  const needEncryption = watch('needEncryption');

  useEffect(() => {
    if (media && visible) {
      reset({
        priority: media.convertPriority ?? 10,
        needEncryption: media.needEncryption ?? false,
        resourceId: media.resourceId ?? '',
      });
    }
  }, [media, visible, reset]);

  const onSubmit = async (values: ReEncodeFormValues) => {
    if (!media) return;
    await onConfirm(media.id, {
      priority: values.priority,
      needEncryption: values.needEncryption,
      resourceId: values.needEncryption ? values.resourceId : undefined,
    });
    onCancel();
  };

  if (!media) return null;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Xác nhận Re-encode Media #{media.id}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Kích hoạt Re-encode sẽ đặt lại <strong>convert_status = 100</strong> trên kho CSM và chuyển video sang <strong>Chờ convert (0)</strong> trong hệ thống PE để quét lại.
          </DialogDescription>
        </DialogHeader>

        {/* Media Quick Info */}
        <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tên Media:</span>
            <span className="font-semibold text-foreground truncate max-w-[200px]">{media.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Video PE liên kết:</span>
            <span className="font-mono font-semibold text-primary">
              {media.linkedVideoId ? `#${media.linkedVideoId}` : 'Chưa có'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Độ ưu tiên (Priority)
            </label>
            <Input
              type="number"
              min={0}
              max={10000}
              {...register('priority', { valueAsNumber: true })}
              className="h-9"
            />
            {errors.priority && (
              <p className="text-[11px] text-destructive">{errors.priority.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Số càng lớn thì hệ thống càng ưu tiên xử lý trước.
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground cursor-pointer">
                Mã hóa DRM:
              </label>
              <Switch
                checked={needEncryption}
                onCheckedChange={(val) => setValue('needEncryption', val)}
              />
            </div>

            {needEncryption && (
              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-foreground">
                  Resource ID / DRM Key <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="VD: DRM_VIETTEL_ASSET_123"
                  {...register('resourceId')}
                  className="h-8 text-xs"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang kích hoạt...' : 'Xác nhận Re-encode'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
