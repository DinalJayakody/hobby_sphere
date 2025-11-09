import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { posts as initialPosts, stories as initialStories, notifications as initialNotifications } from '../data/mockData';
import { Post, Story, Notification, Follower } from '../types';
import { useAuth } from '../context/AuthContext';
// import axios from 'axios';
import axiosInstance from "../types/axiosInstance";
import { desc } from 'framer-motion/client';

interface Group {
  id: string;
  name: string;
  description?: string;
  privacy: string;
  groupImage: string;
  memberCount: number;
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
  createGroup: (payload: any, file?: File | null) => Promise<any>;
  fetchGroupById: (groupId: string) => Promise<any>;
  managedGroups: Group[];
  joinedGroups: Group[];
  suggestedGroups: Group[];
  searchGroups: (query: string, page?: number, size?: number) => Promise<void>;
  createGroupPost: (groupId: string, body: FormData) => Promise<any>;
  joinGroup: (groupId: string) => Promise<any>;
  leaveGroup: (groupId: string) => Promise<any>;
  inviteMember: (groupId: string, email: string) => Promise<any>;
  updateGroup: (groupId: string, formData: FormData) => Promise<any>;
  followers: Follower[];
  fetchFollowers: (userId?: number) => Promise<void>;
  followersLoading: boolean;
  followersError?: string | null;
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

    const [managedGroups, setManagedGroups] = useState<Group[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [suggestedGroups, setSuggestedGroups] = useState<Group[]>([]);

    const [followers, setFollowers] = useState<Follower[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState<string | null>(null);

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

  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Create group API call (multipart/form-data)
  const createGroup = useCallback(
    async (payload: { name: any; description: any; privacy: any; }, file?: File | null) => {
      try {
        const formData = new FormData();

        // 1️⃣ Append JSON as a blob
        const createGroupRequest = {
          name: payload.name,
          description: payload.description || "",
          privacy: payload.privacy,
        };

        formData.append(
          "createGroupRequest",
          new Blob([JSON.stringify(createGroupRequest)], {
            type: "application/json",
          })
        );

        // 2️⃣ Append file if exists
        if (file) {
          formData.append("groupImage", file);
        }

        // 3️⃣ Debug log
        for (const [key, value] of formData.entries()) {
          console.log(`${key} →`, value);
        }

        // 4️⃣ POST call WITHOUT manually setting Content-Type
        const res = await axiosInstance.post("/api/groups/create", formData);

        // 5️⃣ Return response
        return res.data;
      } catch (err: any) {
        console.error("Create group error:", err.response?.data || err.message);
        throw err;
      }
    },
    []
  );

  const fetchGroupById = async (groupId: string) => {
  // GET group by id (returns group + role for current user)
  // API: GET /api/groups/:groupId
  const res = await axiosInstance.get(`/api/groups/${groupId}`);
  return res.data; // expected: { group: {...}, role: 'admin'|'member'|'guest' }
};

// ✅ Search API call
  const searchGroups = useCallback(
    async (query: string, page = 0, size = 20) => {
      try {
        const res = await axiosInstance.get(
          `/api/groups/search?page=${page}&size=${size}&name=${encodeURIComponent(query)}`
        );
        const data = res.data;
if (data.success) {
        // Save the fetched groups in joinedGroups
        setSuggestedGroups(
          (data.data || []).map((g: any) => ({
            id: g.groupId,
            name: g.groupName,
            description: g.description,
            privacy: g.privacy,
            memberCount: g.memberCount,
            groupImage: g.groupImage,
          }))
        );
      } else {
        setJoinedGroups([]);
      }
        // Assuming the backend returns { managed: [], joined: [], suggested: [] }
        // setManagedGroups(data.managed || []);
        // setJoinedGroups(data.joined || []);
        // setSuggestedGroups(data.suggested || []);
      } catch (err) {
        console.error("Search groups error:", err);
      }
    },
    []
  );


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


 const fetchFollowers = useCallback(async (userId?: number) => {
    try {
      setFollowersLoading(true);
      setFollowersError(null);

      // example endpoint: /api/users/{userId}/followers
      // if userId undefined, you can call /api/users/me/followers or your app's appropriate route
      const url = userId ? `/api/users/followers` : `/api/users/me/followers`;

      const res = await axiosInstance.get(url);
      // inspect res.data structure in console if unknown
      // console.log("followers API response", res.data);
console.log("Followers API response", res.data);
      // Example mapping: adapt to your backend response
      // Suppose backend returns { success: true, data: [ { id, fullName, username, avatarUrl } ] }
      const raw = res.data;
      const items = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

      const mapped: Follower[] = items.map((it: any) => ({
        id: it.id ?? it.userId ?? 0,
        fullName: it.name ?? `${it.name ?? ""} ${it.name ?? ""}`.trim(),
        username: it.username ?? it.handle ?? it.userName ?? "",
        // If backend returns avatar as base64 string, keep it as-is; else assume URL
        avatarUrl: it.userProfilePic ?? it.userProfilePic ? `data:image/png;base64,${it.userProfilePic}` : undefined,
      }));
      

      setFollowers(mapped);
    } catch (err: any) {
      console.error("fetchFollowers error:", err);
      // Friendly message or backend-provided message
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to fetch followers";
      setFollowersError(message);
      setFollowers([]);
    } finally {
      setFollowersLoading(false);
    }
  }, []);


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
        managedGroups,
  joinedGroups,
  suggestedGroups,
  searchGroups,
        createGroupPost,
        joinGroup,
        leaveGroup,
        inviteMember,
        updateGroup,
        followers,
        fetchFollowers,
        followersLoading,
        followersError,
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