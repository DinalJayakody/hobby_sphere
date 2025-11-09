import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { posts as initialPosts, stories as initialStories, notifications as initialNotifications } from '../data/mockData';
import { Post, Story, Notification } from '../types';
import { useAuth } from '../context/AuthContext';
// import axios from 'axios';
import axiosInstance from "../types/axiosInstance";

interface CreateGroupPayload {
  name: string;
  description?: string;
  privacy: "public" | "private";
  // image - will be sent as multipart/form-data
}

interface DataContextType {
  posts: Post[];
  stories: Story[];
  notifications: Notification[];
  addPost: (post: Omit<Post, 'id' | 'timestamp'> & { images?: File[] }) => Promise<boolean>;
  addStory: (story: Omit<Story, 'id' | 'timestamp'>) => void;
  likePost: (postId: string) => void;
  savePost: (postId: string, userId: string) => Promise<boolean>;
  viewStory: (storyId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  createGroup: (payload: CreateGroupPayload, file?: File | null) => Promise<any>;
  fetchGroupById: (groupId: string) => Promise<any>;
  createGroupPost: (groupId: string, body: FormData) => Promise<any>;
  joinGroup: (groupId: string) => Promise<any>;
  leaveGroup: (groupId: string) => Promise<any>;
  inviteMember: (groupId: string, email: string) => Promise<any>;
  updateGroup: (groupId: string, formData: FormData) => Promise<any>;
  clearData: () => void;
  unreadNotificationsCount: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Set base URL for axios (adjust if your backend URL changes)
// axios.defaults.baseURL = 'http://localhost:8080';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0); // Start from page 0
  const [hasMore, setHasMore] = useState(true); // Track if more posts exist
  const [post, setPost] = useState<Post | null>(null);
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const clearData = () => {
    setPosts([]);
    // setStories([initialStories[5]]); // Keep only the initial story
    // setNotifications([]);
    // setPage(0);
    setHasMore(true);
  };

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
      // const response = await axiosInstance.get(`/api/post/user/${userId}`,  {
      // params: { page: pageNum, size }
      const response = await axiosInstance.get(`/api/post/feed`, {
        params: { page: pageNum, size }

      });
      console.log("Post User", response);

      const apiPosts = response.data.content || [];

      // Map API response to match Post interface
      const formattedPosts: Post[] = apiPosts.map((p: any) => ({
        id: p.id.toString(),
        userId: p.userId.toString(),
        user: {
          id: p.userId,
          fullName: p.fullName || "Unknown User",
          profilePicture: p.profilePictureUrl || "", // handle profile pic if available
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
        console.log("Prev Posts", prevPosts);
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


  const savePost = async (postId: string, userId: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.post(
        `/api/savePost/${encodeURIComponent(postId)}/${encodeURIComponent(userId)}`
      );
      console.log("Save Post Response:", response);
      const data = response.data;

      // If the API returns the updated post, sync it into state
      if (data.post) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId && p.userId === userId ? { ...p, ...data.post } : p))
        );
      }

      console.log("✅ Post save success:", data.message || "Success");
      return true;
    } catch (error: any) {
      console.error("❌ Save post failed:", error.response?.data || error.message);
      return false;
    }
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

  // Create group API call (multipart/form-data)
  const createGroup = useCallback(async (payload: CreateGroupPayload, file?: File | null) => {
    try {
      // Build formData for file upload
      // const formData = new FormData();
      // formData.append("name", payload.name);
      // formData.append("description", payload.description || "");
      // formData.append("privacy", payload.privacy);

      // if (file) {
      //   // backend expects key 'image' — adjust if your API expects different name
      //   formData.append("groupImage", file);
      // }

const formData = new FormData();

// Construct your JSON object
const createGroupRequest = {
  name: payload.name,
  description: payload.description,
  privacy: payload.privacy,
};

// Append JSON as a blob (Spring expects this)
formData.append(
  "createGroupRequest",
  new Blob([JSON.stringify(createGroupRequest)], {
    type: "application/json",
  })
);

// Append image (optional)
if (file) {
  formData.append("groupImage", file);
}


      // Example POST call to create group endpoint
      // IMPORTANT: axiosInstance should NOT override Content-Type for multipart; browser sets boundary
      const res = await axiosInstance.post("/api/groups/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // return response data to component
      return res.data;
    } catch (err) {
      // rethrow for UI to handle
      throw err;
    }
  }, []);

  const fetchGroupById = async (groupId: string) => {
  // GET group by id (returns group + role for current user)
  // API: GET /api/groups/:groupId
  const res = await axiosInstance.get(`/api/groups/${groupId}`);
  return res.data; // expected: { group: {...}, role: 'admin'|'member'|'guest' }
};

const createGroupPost = async (groupId: string, body: FormData) => {
  // POST /api/groups/:groupId/posts (multipart if file included)
  const res = await axiosInstance.post(`/api/groups/${groupId}/posts`, body);
  return res.data;
};

const joinGroup = async (groupId: string) => {
  // POST /api/groups/:groupId/join
  const res = await axiosInstance.post(`/api/groups/${groupId}/join`);
  return res.data;
};

const leaveGroup = async (groupId: string) => {
  // POST /api/groups/:groupId/leave
  const res = await axiosInstance.post(`/api/groups/${groupId}/leave`);
  return res.data;
};

const inviteMember = async (groupId: string, email: string) => {
  // POST /api/groups/:groupId/invite { email }
  const res = await axiosInstance.post(`/api/groups/${groupId}/invite`, { email });
  return res.data;
};

const updateGroup = async (groupId: string, formData: FormData) => {
  // PUT /api/groups/:groupId
  const res = await axiosInstance.put(`/api/groups/${groupId}`, formData);
  return res.data;
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
        savePost,
        viewStory,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        createGroup,
        fetchGroupById,
        createGroupPost,
        joinGroup,
        leaveGroup,
        inviteMember,
        updateGroup,
        clearData,
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