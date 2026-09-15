import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideCloseButton={true}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-[420px] p-6 font-inter"
      >
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-base font-bold font-inter text-foreground">
            Xác nhận đăng xuất
          </DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground font-roboto leading-relaxed">
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Dashboard PE không? Phiên làm việc của bạn sẽ kết thúc.
          </p>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-inter"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className="text-xs font-semibold font-inter bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Đăng xuất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
