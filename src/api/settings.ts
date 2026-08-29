import axiosInstance from '../types/axiosInstance';
import { ApiResponse } from './users';

export type ProfileVisibility = 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';
export type PostPrivacyPreference = 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';

export interface UserSettingsDto {
  darkThemeEnabled: boolean;
  profileVisibility: ProfileVisibility;
  locationVisible: boolean;
  defaultPostPrivacy: PostPrivacyPreference;
}

export interface UpdateSettingsRequest {
  darkThemeEnabled?: boolean;
  profileVisibility?: ProfileVisibility;
  locationVisible?: boolean;
  defaultPostPrivacy?: PostPrivacyPreference;
}

export const getSettings = () =>
  axiosInstance.get<ApiResponse<UserSettingsDto>>('/api/settings');

export const updateSettings = (payload: UpdateSettingsRequest) =>
  axiosInstance.patch<ApiResponse<UserSettingsDto>>('/api/settings', payload);

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Requires the caller's own current password — this is the real, direct
// "change my password while logged in" endpoint, distinct from the
// email-OTP forgot-password flow used when the user is signed out and can't
// prove identity that way. Rejects Google/Apple-authenticated accounts
// server-side (they have no password the user actually knows).
export const changePassword = (payload: ChangePasswordRequest) =>
  axiosInstance.post<ApiResponse<null>>('/api/settings/change-password', payload);
