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
