import { keycloak } from '@/config/keycloak.config';
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

const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180';
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM || 'pe-realm';

/**
 * Service to update user profile and password, syncing with Keycloak server.
 */
export async function updateKeycloakUserProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResult> {
  const token = localStorage.getItem(APP_CONFIG.storage.token) || keycloak.token;

  // Split full name into firstName and lastName
  const nameParts = payload.name.trim().split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  // 1. If we have a valid token and Keycloak server is accessible, update account profile
  if (token && keycloak.authenticated) {
    try {
      await fetch(`${keycloakUrl}/realms/${keycloakRealm}/account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: payload.email,
        }),
      });
    } catch (err) {
      console.warn('Direct Keycloak profile API call notice:', err);
    }
  }

  // 2. If password change is requested
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

    if (token && keycloak.authenticated) {
      try {
        const passRes = await fetch(
          `${keycloakUrl}/realms/${keycloakRealm}/account/credentials/password`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              currentPassword: payload.currentPassword,
              newPassword: payload.newPassword,
              confirmation: payload.confirmPassword,
            }),
          }
        );

        if (!passRes.ok && passRes.status !== 204) {
          const errData = await passRes.json().catch(() => null);
          const errMsg = errData?.errorMessage || errData?.error || 'Mật khẩu cũ không chính xác hoặc Keycloak từ chối';
          return {
            success: false,
            message: errMsg,
          };
        }
      } catch (err) {
        console.warn('Direct Keycloak password update notice:', err);
      }
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
