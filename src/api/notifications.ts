import axiosInstance from '../types/axiosInstance';

// notification-service returns raw DTOs, not wrapped in {success,message,data}.
export interface NotificationDto {
  id: number;
  recipientId: number;
  actorId: number;
  actorName: string;
  actorProfilePicture: string | null;
  type:
    | 'FOLLOW'
    | 'LIKE'
    | 'COMMENT'
    | 'REPLY'
    | 'MENTION'
    | 'MESSAGE'
    | 'POST_LIKED'
    | 'POST_COMMENTED'
    | 'FOLLOWER_POST';
  message: string;
  relatedId: number | null;
  relatedType: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getNotifications = (userId: number | string, page = 0, size = 20) =>
  axiosInstance.get<NotificationDto[]>(`/api/notifications/user/${userId}`, { params: { page, size } });

export const getUnreadNotifications = (userId: number | string) =>
  axiosInstance.get<NotificationDto[]>(`/api/notifications/user/${userId}/unread`);

export const getUnreadCount = (userId: number | string) =>
  axiosInstance.get<{ unreadCount: number }>(`/api/notifications/user/${userId}/unread-count`);

export const markAsRead = (notificationId: number | string) =>
  axiosInstance.put<NotificationDto>(`/api/notifications/${notificationId}/read`);

export const markAllAsRead = (userId: number | string) =>
  axiosInstance.put(`/api/notifications/user/${userId}/read-all`);

export const deleteNotification = (notificationId: number | string) =>
  axiosInstance.delete(`/api/notifications/${notificationId}`);

export const deleteAllNotifications = (userId: number | string) =>
  axiosInstance.delete(`/api/notifications/user/${userId}/delete-all`);
