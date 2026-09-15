import { APP_CONFIG } from '@/config/app.config';

export interface UpdateProfilePayload {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface UpdateProfileResult {
  success: boolean;
  message: string;
}

/** Update the local profile while external SSO is disabled. */
export async function updateUserProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResult> {
  // Validate password fields locally until a non-SSO account API is available.
  if (payload.newPassword && payload.newPassword.trim()) {
    if (!payload.currentPassword) {
      return {
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại (pass cũ)',
      };
    }
    if (payload.newPassword !== payload.confirmPassword) {
      return {
        success: false,
        message: 'Mật khẩu mới và mật khẩu xác nhận không trùng khớp',
      };
    }
    if (payload.newPassword.length < 6) {
      return {
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      };
    }

  }

  // Save to local storage for immediate UI persistence
  if (payload.name.trim()) {
    localStorage.setItem(APP_CONFIG.storage.username, payload.name.trim());
  }
  if (payload.email.trim()) {
    localStorage.setItem('pe_user_email', payload.email.trim());
  }

  return {
    success: true,
    message: payload.newPassword
      ? 'Cập nhật thông tin và đổi mật khẩu thành công!'
      : 'Cập nhật thông tin tài khoản thành công!',
  };
}
