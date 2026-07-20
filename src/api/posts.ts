import axiosInstance from '../types/axiosInstance';

// Post-service DTOs, as actually returned by the live API (post-service
// endpoints are NOT wrapped in {success,message,data} — unlike user-service).
export interface PostDto {
  id: number;
  userId: number;
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  username: string | null;
  fullName: string | null;
  profilePictureUrl: string | null;
  currentUserLikeStatus: boolean;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const getFeed = (page = 0, size = 10) =>
  axiosInstance.get<PageResult<PostDto>>('/api/post/feed', { params: { page, size } });

export const getPostsByUser = (userId: number | string, page = 0, size = 10) =>
  axiosInstance.get<PageResult<PostDto>>(`/api/post/user/${userId}`, { params: { page, size } });

export const getTrendingPosts = (page = 0, size = 10) =>
  axiosInstance.get<PageResult<PostDto>>('/api/post/trending', { params: { page, size } });

export const searchPosts = (keyword: string, page = 0, size = 10) =>
  axiosInstance.get<PageResult<PostDto>>('/api/post/search', { params: { keyword, page, size } });

export const getPostById = (postId: number | string) =>
  axiosInstance.get<PostDto>(`/api/post/${postId}`);

export const createPost = (
  createPostRequest: { userId: number; content: string; privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY' },
  images: File[] = []
) => {
  const formData = new FormData();
  formData.append(
    'createPostRequest',
    new Blob([JSON.stringify(createPostRequest)], { type: 'application/json' })
  );
  images.forEach((img) => formData.append('profilePicture', img));
  return axiosInstance.post<PostDto>('/api/post/create', formData);
};

export const deletePost = (postId: number | string) =>
  axiosInstance.delete(`/api/post/${postId}`);

export const likePost = (postId: number | string, userId: number | string) =>
  axiosInstance.post<PostDto>(`/api/post/${postId}/like`, null, { params: { userId } });

export const unlikePost = (postId: number | string, userId: number | string) =>
  axiosInstance.delete<PostDto>(`/api/post/${postId}/like`, { params: { userId } });

export const sharePost = (postId: number | string) =>
  axiosInstance.post(`/api/post/${postId}/share`);

// Toggle endpoint: calling it once saves the post, calling it again unsaves
// it. The response `message` tells us which happened — there is no separate
// unsave endpoint.
export const toggleSavePost = (postId: number | string, userId: number | string) =>
  axiosInstance.post<{ success: boolean; message: string; data: string }>(
    `/api/savePost/${postId}/${userId}`
  );

export interface PostSaveDto {
  id: number;
  userId: number;
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  privacy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getSavedPosts = (userId: number | string, page = 0, size = 10) =>
  axiosInstance.get<PageResult<PostSaveDto>>(`/api/savePost/${userId}`, { params: { page, size } });
