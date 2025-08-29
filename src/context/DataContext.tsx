import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { posts as initialPosts, stories as initialStories, notifications as initialNotifications } from '../data/mockData';
import { Post, Story, Notification } from '../types';
import { useAuth } from '../context/AuthContext';
// import axios from 'axios';
import axiosInstance from "../types/axiosInstance";


interface DataContextType {
  posts: Post[];
  stories: Story[];
  notifications: Notification[];
  addPost: (post: Omit<Post, 'id' | 'timestamp'> & { images?: File[] }) => Promise<boolean>;
  addStory: (story: Omit<Story, 'id' | 'timestamp'>) => void;
  likePost: (postId: string) => void;
  viewStory: (storyId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Set base URL for axios (adjust if your backend URL changes)
// axios.defaults.baseURL = 'http://localhost:8080';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   const [loading, setLoading] = useState(false);
  const { user} = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0); // Start from page 0
  const [hasMore, setHasMore] = useState(true); // Track if more posts exist
   const [post, setPost] = useState<Post | null>(null);
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    // On mount, load token and fetch user details
useEffect(() => {
  const token = localStorage.getItem('token');
 if (token) {
      //  axios.defaults.headers.common['Authorization'] = token;
       if (user && user.id) {
         fetchPostDetails(user.id, 0).finally(() => setLoading(false));
       } else {
         setLoading(false);
       }
     } else {
       setLoading(false);
     }
      
}, [user?.id]);

   // Fetch post details function
  const fetchPostDetails = async (userId: string, pageNum = page, size = 10) => {
      if (loading) return; // Prevent duplicate calls
      setLoading(true);

    try {
      // Get posts to display immediatly
      const response = await axiosInstance.get(`/api/post/user/${userId}`,  {
      params: { page: pageNum, size }
    });


    const apiPosts = response.data.content || [];

    // Map API response to match Post interface
    const formattedPosts: Post[] = apiPosts.map((p: any) => ({
      id: p.id.toString(),
      userId: p.userId.toString(),
      user: {
        id: p.userId,
        fullName: p.fullName || "Unknown User",
        profilePicture: p.userProfilePicture || "", // handle profile pic if available
      },
      content: p.content,
      images: p.imageUrls || [], // map imageUrls to images array
      likes: p.likesCount || 0,
      comments: p.commentsCount || 0,
      timestamp: p.createdAt || new Date().toISOString(),
      liked: p.liked || false,
    }));

    setPosts((prevPosts) => {
  const mergedPosts = [...formattedPosts, ...prevPosts];
  const uniquePosts = mergedPosts.filter(
    (post, index, self) => index === self.findIndex((p) => p.id === post.id)
  );
  return uniquePosts;
});
    setHasMore(!response.data.last); // If it's the last page, stop fetching
    setPage(pageNum + 1); // Increment page for next call

  } catch (err) {
    console.error('Failed to fetch posts:', err);
  } finally {
    setLoading(false);
  }
};

  const addPost = async (post: Omit<Post, 'id' | 'timestamp'> & { images?: File[] }) => {
    setLoading(true);

    try {
      console.log('Adding post:', post);
      const formData = new FormData();
      formData.append("createPostRequest", new Blob([JSON.stringify({
        ...post, images: undefined
      })], { type: "application/json" }));


      if (post.images && Array.isArray(post.images)) {
        (post.images as File[]).forEach((image) => {
          formData.append("profilePicture", image);
        });
      }

      // Debug purpose: log the form data
      for (const [key, value] of formData.entries()) {
  console.log(`${key}:`, value);  // <-- This will show text and files
}
      console.log('Form data prepared:', formData);
      console.log('Post content:', post);
      console.log(formData.get("selectedFiles")); 

      const response = await axiosInstance.post('/api/post/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // const { token, type } = response.data;
      // const fullToken = `${type} ${token}`;

      // localStorage.setItem('token', fullToken);
      // axios.defaults.headers.common['Authorization'] = fullToken;

      if (user?.id) {
        await fetchPostDetails(user.id, 0);
      }
      return true;
     } catch (error) {
      console.error('Posting Failed', error);
      return false;
    } finally {
      setLoading(false);
    }

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