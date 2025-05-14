import React, { createContext, useContext, useState, ReactNode } from 'react';
import { posts as initialPosts, stories as initialStories, notifications as initialNotifications } from '../data/mockData';
import { Post, Story, Notification } from '../types';

interface DataContextType {
  posts: Post[];
  stories: Story[];
  notifications: Notification[];
  addPost: (post: Omit<Post, 'id' | 'timestamp'>) => void;
  addStory: (story: Omit<Story, 'id' | 'timestamp'>) => void;
  likePost: (postId: string) => void;
  viewStory: (storyId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const addPost = (post: Omit<Post, 'id' | 'timestamp'>) => {
    const newPost: Post = {
      ...post,
      id: `post-${Date.now()}`,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      liked: false
    };
    setPosts([newPost, ...posts]);
  };

  const addStory = (story: Omit<Story, 'id' | 'timestamp'>) => {
    const newStory: Story = {
      ...story,
      id: `story-${Date.now()}`,
      timestamp: new Date().toISOString(),
      viewed: false
    };
    setStories([newStory, ...stories]);
  };

  const likePost = (postId: string) => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );
  };

  const viewStory = (storyId: string) => {
    setStories(
      stories.map(story => {
        if (story.id === storyId) {
          return { ...story, viewed: true };
        }
        return story;
      })
    );
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, read: true };
        }
        return notification;
      })
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <DataContext.Provider
      value={{
        posts,
        stories,
        notifications,
        addPost,
        addStory,
        likePost,
        viewStory,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};