import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { Heart, MessageCircle, UserPlus, AtSign, Tag, Bell } from 'lucide-react';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } = useData();
  
  useEffect(() => {
    // Mark all as read when component mounts
    markAllNotificationsAsRead();
  }, [markAllNotificationsAsRead]);

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      case 'tag':
        return <Tag className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const handleClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    if (notification.postId) {
      navigate(`/posts/${notification.postId}`);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.user.username}`);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 pt-16 pb-24 md:pt-20 md:pb-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
          
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
              <p className="text-gray-500">You'll see notifications here when people interact with you.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-sky-50' : ''
                  }`}
                  onClick={() => handleClick(notification)}
                >
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <Avatar
                      src={notification.user.profilePicture}
                      alt={notification.user.username}
                      size="md"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{notification.user.fullName}</span>
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700">
                      {notification.content}
                      {notification.type === 'follow' && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Follow back logic would go here
                          }}
                        >
                          Follow Back
                        </Button>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;