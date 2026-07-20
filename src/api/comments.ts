import axiosInstance from '../types/axiosInstance';
import { PageResult } from './posts';

// Note: the post-service has no "like a comment" endpoint at all — don't
// build UI that implies comments can be liked.
export interface CommentDto {
  id: number;
  postId: number;
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

export const getCommentsByPost = (postId: number | string, page = 0, size = 20) =>
  axiosInstance.get<PageResult<CommentDto>>(`/api/comments/post/${postId}`, { params: { page, size } });

export const getCommentsCount = (postId: number | string) =>
  axiosInstance.get<number>(`/api/comments/post/${postId}/count`);

export const getRepliesByComment = (commentId: number | string) =>
  axiosInstance.get<CommentDto[]>(`/api/comments/${commentId}/replies`);

// Replies are just comments with parentCommentId set — there is no separate
// "reply" endpoint.
export const createComment = (params: {
  postId: number | string;
  userId: number | string;
  content: string;
  parentCommentId?: number | string;
}) =>
  axiosInstance.post<CommentDto>('/api/comments', null, {
    params: {
      postId: params.postId,
      userId: params.userId,
      content: params.content,
      ...(params.parentCommentId ? { parentCommentId: params.parentCommentId } : {}),
    },
  });

export const updateComment = (commentId: number | string, content: string) =>
  axiosInstance.put<CommentDto>(`/api/comments/${commentId}`, null, { params: { content } });

export const deleteComment = (commentId: number | string) =>
  axiosInstance.delete(`/api/comments/${commentId}`);
