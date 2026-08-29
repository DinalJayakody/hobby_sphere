import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import { usePreferences } from './PreferencesContext';
import * as notificationsApi from '../api/notifications';
import { resolveImageSrc } from '../utils/image';

// Split out of DataContext: notifications are the only thing in this app that
// poll on an interval (the notification service has no push/WebSocket
// channel). Keeping them in the same context as posts/comments/groups meant
// every 20s tick re-rendered the entire authenticated app — every PostCard in
// the feed included — since a single context value object changes identity
// whenever any piece of its state changes. Isolating that state here means
// the poll only re-renders components that actually read notification data
// (Navbar's badge, the Notifications page).

interface NotificationsContextType {
  notifications: Notification[];
  notificationsLoading: boolean;
  unreadNotificationsCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  removeNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  clearNotificationsState: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const mapNotification = (n: notificationsApi.NotificationDto): Notification => ({
  id: n.id.toString(),
  recipientId: n.recipientId.toString(),
  actorId: n.actorId.toString(),
  actorName: n.actorName,
  actorProfilePicture: n.actorProfilePicture ? resolveImageSrc(n.actorProfilePicture) : null,
  type: n.type,
  message: n.message,
  relatedId: n.relatedId?.toString(),
  relatedType: n.relatedType ?? undefined,
  read: n.isRead,
  timestamp: n.createdAt,
});

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { pushNotificationsEnabled } = usePreferences();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const clearNotificationsState = useCallback(() => {
    setNotifications([]);
    setUnreadNotificationsCount(0);
  }, []);

  // The full list endpoint (GET /api/notifications/user/{id}) is expensive on
  // notification-service: an unbounded, unpaginated DB query plus a fresh
  // disk/HTTP read + Base64-encode of every distinct actor's avatar on every
  // single call, with no server-side caching. The unread-count endpoint, by
  // contrast, is Redis-cached there and cheap. So the recurring background
  // poll below only ever calls the cheap count endpoint — the expensive list
  // is fetched just once on login and again whenever the Notifications page
  // is actually opened (see fetchNotifications, called from pages/Notifications.tsx),
  // since that's the only place the list is ever rendered.
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const countRes = await notificationsApi.getUnreadCount(user.id);
      setUnreadNotificationsCount(countRes.data.unreadCount || 0);
    } catch (err) {
      console.error('Fetch unread count failed:', err);
    }
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setNotificationsLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsApi.getNotifications(user.id, 0, 30),
        notificationsApi.getUnreadCount(user.id),
      ]);
      setNotifications(listRes.data.map(mapNotification));
      setUnreadNotificationsCount(countRes.data.unreadCount || 0);
    } catch (err) {
      console.error('Fetch notifications failed:', err);
    } finally {
      setNotificationsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !pushNotificationsEnabled) return;
    fetchUnreadCount();

    // Poll periodically to keep the unread badge reasonably fresh, but never
    // while the tab is backgrounded — a hidden tab has no UI for the badge to
    // update, so polling it is pure wasted VPS/Cloudflare/DB load. Coming
    // back to the tab triggers one immediate refresh instead.
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchUnreadCount();
    }, 20000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchUnreadCount();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.id, pushNotificationsEnabled, fetchUnreadCount]);

  const markNotificationAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadNotificationsCount((c) => Math.max(0, c - 1));
    try {
      await notificationsApi.markAsRead(notificationId);
    } catch (err) {
      console.error('Mark notification read failed:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user?.id) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadNotificationsCount(0);
    try {
      await notificationsApi.markAllAsRead(user.id);
    } catch (err) {
      console.error('Mark all notifications read failed:', err);
    }
  };

  const removeNotification = async (notificationId: string) => {
    const previous = notifications;
    const target = notifications.find((n) => n.id === notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (target && !target.read) setUnreadNotificationsCount((c) => Math.max(0, c - 1));
    try {
      await notificationsApi.deleteNotification(notificationId);
    } catch (err) {
      console.error('Delete notification failed:', err);
      setNotifications(previous);
      if (target && !target.read) setUnreadNotificationsCount((c) => c + 1);
    }
  };

  const clearAllNotifications = async () => {
    if (!user?.id) return;
    const previous = notifications;
    const previousUnread = unreadNotificationsCount;
    setNotifications([]);
    setUnreadNotificationsCount(0);
    try {
      await notificationsApi.deleteAllNotifications(user.id);
    } catch (err) {
      console.error('Delete all notifications failed:', err);
      setNotifications(previous);
      setUnreadNotificationsCount(previousUnread);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        notificationsLoading,
        unreadNotificationsCount,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeNotification,
        clearAllNotifications,
        clearNotificationsState,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
};
