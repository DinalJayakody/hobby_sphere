import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import * as usersApi from '../api/users';
import Navbar from '../components/layout/Navbar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { Heart, MessageCircle, UserPlus, AtSign, Bell, Send } from 'lucide-react';
import { Notification, NotificationType } from '../types';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, notificationsLoading, markAllNotificationsAsRead, markNotificationAsRead } = useData();
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Mark all as read when the notifications screen is opened
    if (notifications.some((n) => !n.read)) {
      markAllNotificationsAsRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - notifTime.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return notifTime.toLocaleDateString();
  };

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
    } catch (err) {
      console.error('Follow back failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-16 pb-24 md:pt-20 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h1 className="text-xl font-bold">Notifications</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllNotificationsAsRead}
            >
              Mark all as read
            </Button>
          </div>

          {notificationsLoading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 animate-pulse">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-float" />
              <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
              <p className="text-gray-500">You'll see notifications here when people interact with you.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  style={{ animationDelay: `${Math.min(index, 10) * 0.04}s` }}
                  className={`animate-slide-up relative flex items-start p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-sky-50' : ''
                  }`}
                  onClick={() => handleClick(notification)}
                >
                  {!notification.read && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-500" />
                  )}
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <Avatar
                      src={notification.actorProfilePicture || ''}
                      alt={notification.actorName}
                      size="md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{notification.actorName}</span>
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>

                    <p className="text-gray-700">
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
