import axiosInstance from '../types/axiosInstance';

// user-service wraps most responses in {success, message, data}.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UserDto {
  id: number;
  username: string;
  email?: string;
  fullName: string;
  bio?: string;
  profilePicture: string | null;
  createdAt?: string;
  active?: boolean;
  followersCount: number;
  followingCount: number;
  location?: string;
  mainHobby?: string;
  following?: boolean;
}

export const getUserById = (userId: number | string) =>
  axiosInstance.get<UserDto>(`/api/users/${userId}`);

export const searchUsers = (query: string, hobby = false, nearby = false, page = 0, size = 20) =>
  axiosInstance.get<ApiResponse<UserDto[]>>('/api/users/search', {
    params: { query, hobby, nearby, page, size },
  });

export interface UserSuggestionDto {
  userId: number;
  username: string;
  profilePicture: string | null;
  hobby: string | null;
}

// NOTE: this endpoint is currently broken server-side (missing Redis cache
// config — "Cannot find cache named 'friendSuggestions'"), confirmed live.
// Callers must handle the rejection gracefully rather than surfacing it as a
// user-facing error.
export const getUserSuggestions = (page = 0, size = 20) =>
  axiosInstance.get<ApiResponse<UserSuggestionDto[]>>('/api/users/suggestion', {
    params: { page, size },
  });

export const followUser = (userId: number | string) =>
  axiosInstance.post<ApiResponse<null>>(`/api/users/${userId}/follow`);

export const unfollowUser = (userId: number | string) =>
  axiosInstance.post<ApiResponse<null>>(`/api/users/${userId}/unfollow`);

export interface FollowerDto {
  userId: number;
  name: string;
  userProfilePic: string | null;
  followStatus: boolean;
}

// Only returns the CURRENT authenticated user's followers — the backend has
// no endpoint to view another user's follower list.
export const getMyFollowers = (page = 0, size = 20) =>
  axiosInstance.get<ApiResponse<FollowerDto[]>>('/api/users/followers', { params: { page, size } });

export const getUserFollowing = (userId: number | string, page = 0, size = 20) =>
  axiosInstance.get<ApiResponse<UserDto[]>>(`/api/users/${userId}/following`, { params: { page, size } });

export const checkUsernameExists = (userName: string) =>
  axiosInstance.get<boolean>('/api/users/checkUserNameExist', { params: { userName } });

export const updateProfile = (payload: {
  fullName: string;
  userName: string;
  bio?: string;
  location?: string;
  mainHobby?: string;
  lat?: number;
  lon?: number;
}) => axiosInstance.put<ApiResponse<UserDto>>('/api/users/profile', payload);

export const deleteAccount = () => axiosInstance.delete('/api/users/account');

// ---- Stories ----

export interface StoryDto {
  id: number;
  userId: number;
  username: string;
  profilePictureUrl: string | null;
  mediaUrl: string;
  caption: string | null;
  storyType: string | null;
  createdAt: string;
  expiresAt: string;
}

export const getStoryFeed = () =>
  axiosInstance.get<ApiResponse<StoryDto[]>>('/api/stories/feed');

export const getUserStories = (userId: number | string) =>
  axiosInstance.get<ApiResponse<StoryDto[]>>(`/api/stories/user/${userId}`);

export const createStory = (caption: string, storyType: string, image: File) => {
  const formData = new FormData();
  formData.append(
    'storyRequest',
    new Blob([JSON.stringify({ caption, storyType })], { type: 'application/json' })
  );
  formData.append('storyImage', image);
  return axiosInstance.post<ApiResponse<StoryDto>>('/api/stories', formData);
};

// ---- Groups ----

export interface UserManagedGroupDto {
  groupId: number;
  groupName: string;
  groupImageUrl: string | null;
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
}

export const getUserManagedGroups = (page = 0, size = 20) =>
  axiosInstance.get<ApiResponse<UserManagedGroupDto[]>>('/api/groups/userManagedGroups', {
    params: { page, size },
  });

export interface GroupSearchDto {
  groupId: number;
  groupName: string;
  memberCount: number;
  groupImage: string | null;
  currentUserRole: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' | null;
}

export const searchGroups = (name: string, page = 0, size = 20) =>
  axiosInstance.get<ApiResponse<GroupSearchDto[]>>('/api/groups/search', { params: { name, page, size } });

export const getGroupById = (groupId: number | string) =>
  axiosInstance.get<any>(`/api/groups/${groupId}`);

export const createGroup = (
  request: { name: string; description?: string; privacy: 'PUBLIC' | 'PRIVATE' },
  image?: File | null
) => {
  const formData = new FormData();
  formData.append(
    'createGroupRequest',
    new Blob([JSON.stringify(request)], { type: 'application/json' })
  );
  if (image) formData.append('groupImage', image);
  return axiosInstance.post<any>('/api/groups/create', formData);
};

export interface JoinGroupResponseDto {
  groupId: number;
  /** "JOINED" — public group, membership granted immediately.
   *  "PENDING_APPROVAL" — private group, awaiting admin review. */
  status: 'JOINED' | 'PENDING_APPROVAL';
}

export const joinGroup = (groupId: number | string) =>
  axiosInstance.post<ApiResponse<JoinGroupResponseDto>>(`/api/groups/joinGroup/${groupId}`);

export const leaveGroup = (groupId: number | string) =>
  axiosInstance.post<any>(`/api/groups/leaveGroup/${groupId}`);

export interface JoinRequestDto {
  requestId: number;
  userId: number;
  username: string;
  fullName: string;
  requestedAt: string;
}

// Admin-only. There is no "list all members" endpoint on the backend, so
// this pending-requests view is the closest thing to member management the
// API actually supports today.
export const getPendingJoinRequests = (groupId: number | string, page = 0, size = 20) =>
  axiosInstance.get<ApiResponse<JoinRequestDto[]>>(`/api/groups/${groupId}/join-requests`, {
    params: { page, size },
  });

export const approveJoinRequest = (groupId: number | string, requestId: number | string) =>
  axiosInstance.post<ApiResponse<void>>(`/api/groups/${groupId}/join-requests/${requestId}/approve`);

export const rejectJoinRequest = (groupId: number | string, requestId: number | string) =>
  axiosInstance.post<ApiResponse<void>>(`/api/groups/${groupId}/join-requests/${requestId}/reject`);

export const getGroupsJoined = (page = 0, size = 20) =>
  axiosInstance.get<ApiResponse<UserManagedGroupDto[]>>('/api/groups/joined', { params: { page, size } });

export const deleteGroup = (groupId: number | string) =>
  axiosInstance.delete<void>(`/api/groups/${groupId}`);

// ---- Block / Unblock ----

export interface BlockedUserDto {
  id: number;
  username: string;
  fullName: string;
  profilePicture: string | null;
  blockedAt: string;
}

export const blockUser = (userId: number | string) =>
  axiosInstance.post<ApiResponse<BlockedUserDto>>(`/api/users/${userId}/block`);

export const unblockUser = (userId: number | string) =>
  axiosInstance.delete<void>(`/api/users/${userId}/block`);

export const getBlockedUsers = (page = 0, size = 20) =>
  axiosInstance.get<ApiResponse<BlockedUserDto[]>>('/api/users/blocked', { params: { page, size } });
