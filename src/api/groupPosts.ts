import axiosInstance from '../types/axiosInstance';
import { PageResult } from './posts';

export interface GroupPostDto {
  id: number;
  groupId: number;
  userId: number;
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  currentUserLikeStatus: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  username: string | null;
  fullName: string | null;
}

export const getGroupPosts = (groupId: number | string, page = 0, size = 10) =>
  axiosInstance.get<PageResult<GroupPostDto>>(`/api/group-posts/${groupId}`, { params: { page, size } });

export const createGroupPost = (
  groupId: number | string,
  createGroupPostRequest: { userId: number; content: string },
  images: File[] = []
) => {
  const formData = new FormData();
  formData.append(
    'createGroupPostRequest',
    new Blob([JSON.stringify(createGroupPostRequest)], { type: 'application/json' })
  );
  images.forEach((img) => formData.append('images', img));
  return axiosInstance.post<GroupPostDto>(`/api/group-posts/${groupId}`, formData);
};

export const likeGroupPost = (groupId: number | string, postId: number | string, userId: number | string) =>
  axiosInstance.post<GroupPostDto>(`/api/group-posts/${groupId}/${postId}/like`, null, { params: { userId } });

export const unlikeGroupPost = (groupId: number | string, postId: number | string, userId: number | string) =>
  axiosInstance.delete<GroupPostDto>(`/api/group-posts/${groupId}/${postId}/like`, { params: { userId } });

// ---- Comments ----

export interface GroupPostCommentDto {
  id: number;
  groupPostId: number;
  userId: number;
  content: string;
  parentCommentId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  username: string | null;
  fullName: string | null;
  profilePictureUrl: string | null;
}

export const getGroupPostComments = (
  groupId: number | string,
  postId: number | string,
  page = 0,
  size = 20
) =>
  axiosInstance.get<PageResult<GroupPostCommentDto>>(`/api/group-posts/${groupId}/${postId}/comments`, {
    params: { page, size },
  });

export const getGroupPostCommentReplies = (
  groupId: number | string,
  postId: number | string,
  commentId: number | string
) =>
  axiosInstance.get<GroupPostCommentDto[]>(`/api/group-posts/${groupId}/${postId}/comments/${commentId}/replies`);

export const createGroupPostComment = (
  groupId: number | string,
  postId: number | string,
  params: { userId: number | string; content: string; parentCommentId?: number | string }
) =>
  axiosInstance.post<GroupPostCommentDto>(`/api/group-posts/${groupId}/${postId}/comments`, null, {
    params: {
      userId: params.userId,
      content: params.content,
      ...(params.parentCommentId ? { parentCommentId: params.parentCommentId } : {}),
    },
  });

export const updateGroupPostComment = (
  groupId: number | string,
  postId: number | string,
  commentId: number | string,
  content: string
) =>
  axiosInstance.put<GroupPostCommentDto>(`/api/group-posts/${groupId}/${postId}/comments/${commentId}`, null, {
    params: { content },
  });

export const deleteGroupPostComment = (
  groupId: number | string,
  postId: number | string,
  commentId: number | string
) => axiosInstance.delete(`/api/group-posts/${groupId}/${postId}/comments/${commentId}`);
