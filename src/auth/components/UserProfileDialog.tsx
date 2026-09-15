import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/auth/hooks/useAuth';
import { updateUserProfile } from '@/auth/services/userService';
import { User, Mail, ShieldCheck, Edit3, ArrowLeft } from 'lucide-react';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: (newName: string) => void;
}

export function UserProfileDialog({
  open,
  onOpenChange,
  onProfileUpdated,
}: UserProfileDialogProps) {
  const { username } = useAuth();

  // Mode: 'view' (default) or 'edit'
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (open) {
      const initialName = username || 'Admin';
      const initialEmail = localStorage.getItem('pe_user_email') || 'admin@viettel.vn';

      setName(initialName);
      setEmail(initialEmail);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);
      setErrorMsg('');
      setSuccessMsg('');
      setIsEditing(false); // Always start in View mode
    }
  }, [open, username]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên');
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    if (showPasswordFields || newPassword || currentPassword) {
      if (!currentPassword) {
        setErrorMsg('Vui lòng nhập mật khẩu hiện tại (pass cũ)');
        return;
      }
      if (!newPassword) {
        setErrorMsg('Vui lòng nhập mật khẩu mới');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Mật khẩu mới và mật khẩu xác nhận không trùng khớp');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await updateUserProfile({
        name,
        email,
        currentPassword: showPasswordFields ? currentPassword : undefined,
        newPassword: showPasswordFields ? newPassword : undefined,
        confirmPassword: showPasswordFields ? confirmPassword : undefined,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        if (onProfileUpdated) {
          onProfileUpdated(name);
        }
        setTimeout(() => {
          setIsEditing(false);
          setSuccessMsg('');
        }, 1000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi cập nhật thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton={true}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="w-[92vw] max-w-[480px] p-5 sm:p-6 font-inter max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold font-inter text-foreground flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setIsEditing(false);
                      setErrorMsg('');
                    }}
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <span>Chỉnh sửa thông tin</span>
                </>
              ) : (
                <span>Thông tin tài khoản</span>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 text-xs rounded-lg bg-destructive/10 border border-destructive/20 text-destructive font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 text-xs rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-medium">
            {successMsg}
          </div>
        )}

        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <div className="space-y-4 py-2">
            {/* User Header Profile */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border">
              <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg font-black shrink-0 shadow-xs">
                {(name || username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-foreground truncate font-inter">
                  {name || username || 'Admin'}
                </span>
                <span className="text-xs text-muted-foreground font-roboto truncate">
                  {email || 'admin@viettel.vn'}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold bg-green-500/10 text-green-600 border-green-500/20">
                    Đang hoạt động
                  </Badge>
                </div>
              </div>
            </div>

            {/* Info Details List */}
            <div className="space-y-2.5 bg-card rounded-xl border border-border p-3.5 text-xs font-inter">
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User size={14} className="text-primary/70" />
                  Họ và tên
                </span>
                <span className="font-semibold text-foreground text-right">{name || username || 'Admin'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail size={14} className="text-primary/70" />
                  Email
                </span>
                <span className="font-medium text-foreground text-right">{email || 'admin@viettel.vn'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-primary/70" />
                  Quyền hệ thống
                </span>
                <span className="font-semibold text-primary text-right">Quản trị viên (Admin)</span>
              </div>

            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs font-inter"
              >
                Đóng
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setIsEditing(true);
                }}
                className="text-xs font-semibold font-inter bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
              >
                <Edit3 size={14} />
                Chỉnh sửa
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSave} className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground font-inter">
                Họ và tên / Tên hiển thị <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="text-sm font-inter"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground font-inter">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@viettel.vn"
                className="text-sm font-inter"
                disabled={loading}
              />
            </div>

            {/* Password toggle button */}
            <div className="pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="w-full text-xs font-semibold font-inter justify-between"
              >
                <span>{showPasswordFields ? 'Ẩn đổi mật khẩu' : 'Đổi mật khẩu'}</span>
                <span className="text-[10px] text-muted-foreground">
                  {showPasswordFields ? '▲' : '▼'}
                </span>
              </Button>
            </div>

            {/* Password Fields */}
            {showPasswordFields && (
              <div className="space-y-3 p-3.5 rounded-lg bg-muted/40 border border-border">
                {/* Old Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground font-inter">
                    Mật khẩu hiện tại (Pass cũ) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="text-sm font-inter bg-background"
                    disabled={loading}
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground font-inter">
                    Mật khẩu mới <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="text-sm font-inter bg-background"
                    disabled={loading}
                  />
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground font-inter">
                    Nhập lại mật khẩu mới (Repeat) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại chính xác mật khẩu mới"
                    className="text-sm font-inter bg-background"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setErrorMsg('');
                }}
                disabled={loading}
                className="text-xs font-inter"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="text-xs font-semibold font-inter bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
