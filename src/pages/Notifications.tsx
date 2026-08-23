import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import * as usersApi from '../api/users';
import Navbar from '../components/layout/Navbar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { Heart, MessageCircle, UserPlus, AtSign, Bell, Send, Trash2, X } from 'lucide-react';
import { Notification, NotificationType } from '../types';
import { timeAgo as formatTimestamp } from '../utils/time';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, notificationsLoading, markAllNotificationsAsRead, markNotificationAsRead, removeNotification, clearAllNotifications, showNewlyFollowedUserPosts } = useData();
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Mark all as read when the notifications screen is opened
    if (notifications.some((n) => !n.read)) {
      markAllNotificationsAsRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'LIKE':
      case 'POST_LIKED':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'COMMENT':
      case 'POST_COMMENTED':
      case 'REPLY':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'FOLLOW':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'MENTION':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      case 'MESSAGE':
        return <Send className="w-5 h-5 text-sky-500" />;
      case 'FOLLOWER_POST':
        return <Bell className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const handleClick = (notification: Notification) => {
    if (!notification.read) markNotificationAsRead(notification.id);

    if (notification.type === 'FOLLOW') {
      navigate(`/FriendProfile/${notification.actorId}`);
    } else if (notification.relatedType === 'POST' || notification.relatedType === 'COMMENT') {
      // Posts live in the feed, not on a dedicated route — take the user home
      navigate('/');
    } else if (notification.type === 'MESSAGE') {
      navigate('/chat');
    }
  };

  const handleFollowBack = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    try {
      await usersApi.followUser(notification.actorId);
      setFollowedBack((prev) => new Set(prev).add(notification.id));
      showNewlyFollowedUserPosts(notification.actorId);
    } catch (err) {
      console.error('Follow back failed:', err);
    }
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
    clearAllNotifications();
  };

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-navy-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-16 pb-24 md:pt-20 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface rounded-2xl shadow-soft border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-2">
            <h1 className="text-xl font-bold text-ink">Notifications</h1>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsAsRead}
              >
                Mark all read
              </Button>
              <button
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="p-2 rounded-lg text-ink-muted hover:text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-500/10 transition disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
                aria-label="Clear all notifications"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {notificationsLoading && notifications.length === 0 ? (
            <div className="p-8 text-center text-ink-faint animate-pulse">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-ink-faint animate-float" />
              <h3 className="text-lg font-semibold mb-2 text-ink">No Notifications</h3>
              <p className="text-ink-muted">You'll see notifications here when people interact with you.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  style={{ animationDelay: `${Math.min(index, 10) * 0.04}s` }}
                  className={`animate-slide-up group relative flex items-start p-4 pr-10 hover:bg-surface-muted active:bg-surface-muted cursor-pointer transition-colors ${
                    !notification.read ? 'bg-sky-50 dark:bg-sky-500/10' : ''
                  }`}
                  onClick={() => handleClick(notification)}
                >
                  {!notification.read && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-500" />
                  )}
                  <button
                    onClick={(e) => handleDelete(e, notification.id)}
                    className="absolute right-2 top-2 p-1.5 rounded-full text-ink-faint hover:text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-500/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label="Delete notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <Avatar
                      src={notification.actorProfilePicture || ''}
                      alt={notification.actorName}
                      size="md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-0.5">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="font-semibold text-ink truncate">{notification.actorName}</span>
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm text-ink-faint">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>

                    <p className="text-ink-muted">
                      {notification.message}
                      {notification.type === 'FOLLOW' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="ml-2"
                          disabled={followedBack.has(notification.id)}
                          onClick={(e) => handleFollowBack(e, notification)}
                        >
                          {followedBack.has(notification.id) ? 'Following' : 'Follow Back'}
                        </Button>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
