import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Post, Story, Notification, Follower, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import * as postsApi from '../api/posts';
import * as commentsApi from '../api/comments';
import * as usersApi from '../api/users';
import * as notificationsApi from '../api/notifications';

interface Group {
  id: string;
  name: string;
  description?: string;
  privacy: string;
  groupImage: string;
  memberCount: number;
  currentUserRole?: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' | null;
}

interface DataContextType {
  posts: Post[];
  postsLoading: boolean;
  hasMorePosts: boolean;
  loadMorePosts: () => Promise<void>;
  refreshFeed: () => Promise<void>;

  stories: Story[];
  fetchStories: () => Promise<void>;
  addStory: (caption: string, storyType: string, image: File) => Promise<boolean>;

  notifications: Notification[];
  notificationsLoading: boolean;
  unreadNotificationsCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  comments: { [postId: string]: Comment[] };
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string, postId: string) => Promise<void>;

  replies: { [commentId: string]: Comment[] };
  fetchReplies: (commentId: string) => Promise<void>;
  addReply: (postId: string, commentId: string, content: string) => Promise<void>;

  addPost: (post: { content: string; privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY'; images?: File[] }) => Promise<boolean>;
  likePost: (postId: string) => Promise<void>;
  /** Toggles the saved state and returns the resulting state (true = now saved). */
  toggleSavePost: (postId: string) => Promise<boolean>;

  createGroup: (payload: { name: string; description?: string; privacy: 'PUBLIC' | 'PRIVATE' }, file?: File | null) => Promise<any>;
  fetchGroupById: (groupId: string) => Promise<any>;
  managedGroups: Group[];
  suggestedGroups: Group[];
  searchGroups: (query: string, page?: number, size?: number) => Promise<void>;
  joinGroup: (groupId: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;

  followers: Follower[];
  fetchFollowers: () => Promise<void>;
  followersLoading: boolean;
  followersError?: string | null;

  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const toBase64Image = (raw: string | null | undefined) =>
  raw ? (raw.startsWith('data:') || raw.startsWith('http') ? raw : `data:image/png;base64,${raw}`) : '';

const mapPost = (p: postsApi.PostDto): Post => ({
  id: p.id.toString(),
  userId: p.userId.toString(),
  user: {
    id: p.userId.toString(),
    fullName: p.fullName || 'Unknown User',
    username: p.username || undefined,
    profilePicture: toBase64Image(p.profilePictureUrl),
  },
  content: p.content,
  images: p.imageUrls || [],
  likes: p.likesCount || 0,
  comments: p.commentsCount || 0,
  timestamp: p.createdAt,
  currentUserLikeStatus: p.currentUserLikeStatus,
  privacy: p.privacy,
});

const mapComment = (c: commentsApi.CommentDto): Comment => ({
  id: c.id.toString(),
  postId: c.postId.toString(),
  userId: c.userId.toString(),
  parentCommentId: c.parentCommentId?.toString() ?? null,
  username: c.username ?? undefined,
  fullName: c.fullName ?? undefined,
  profilePictureUrl: c.profilePictureUrl ? toBase64Image(c.profilePictureUrl) : null,
  content: c.content,
  createdAt: c.createdAt,
});

const mapNotification = (n: notificationsApi.NotificationDto): Notification => ({
  id: n.id.toString(),
  recipientId: n.recipientId.toString(),
  actorId: n.actorId.toString(),
  actorName: n.actorName,
  actorProfilePicture: n.actorProfilePicture ? toBase64Image(n.actorProfilePicture) : null,
  type: n.type,
  message: n.message,
  relatedId: n.relatedId?.toString(),
  relatedType: n.relatedType ?? undefined,
  read: n.isRead,
  timestamp: n.createdAt,
});

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [feedPage, setFeedPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [stories, setStories] = useState<Story[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [replies, setReplies] = useState<{ [commentId: string]: Comment[] }>({});

  const [managedGroups, setManagedGroups] = useState<Group[]>([]);
  const [suggestedGroups, setSuggestedGroups] = useState<Group[]>([]);

  const [followers, setFollowers] = useState<Follower[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState<string | null>(null);

  const clearData = () => {
    setPosts([]);
    setFeedPage(0);
    setHasMorePosts(true);
    setNotifications([]);
    setUnreadNotificationsCount(0);
    setStories([]);
    setComments({});
    setReplies({});
  };

  // ---------------- Feed ----------------

  const loadFeedPage = useCallback(async (pageNum: number, replace: boolean) => {
    setPostsLoading(true);
    try {
      const res = await postsApi.getFeed(pageNum, 10);
      const formatted = res.data.content.map(mapPost);
      setPosts((prev) => (replace ? formatted : [...prev, ...formatted]));
      setHasMorePosts(!res.data.last);
      setFeedPage(pageNum + 1);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  const refreshFeed = useCallback(async () => {
    await loadFeedPage(0, true);
  }, [loadFeedPage]);

  const loadMorePosts = useCallback(async () => {
    if (postsLoading || !hasMorePosts) return;
    await loadFeedPage(feedPage, false);
  }, [postsLoading, hasMorePosts, feedPage, loadFeedPage]);

  useEffect(() => {
    if (user?.id) {
      refreshFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const addPost = async (post: { content: string; privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY'; images?: File[] }) => {
    if (!user?.id) return false;
    try {
      await postsApi.createPost(
        { userId: user.id, content: post.content, privacy: post.privacy },
        post.images || []
      );
      await refreshFeed();
      return true;
    } catch (error) {
      console.error('Posting failed:', error);
      return false;
    }
  };

  const likePost = async (postId: string) => {
    const userId = user?.id;
    if (!userId) return;

    const target = posts.find((p) => p.id === postId);
    if (!target) return;
    const wasLiked = target.currentUserLikeStatus;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, currentUserLikeStatus: !wasLiked, likes: wasLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );

    try {
      if (!wasLiked) {
        await postsApi.likePost(postId, userId);
      } else {
        await postsApi.unlikePost(postId, userId);
      }
    } catch (error) {
      console.error('Like/unlike failed:', error);
      // Rollback
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, currentUserLikeStatus: wasLiked, likes: wasLiked ? p.likes + 1 : p.likes - 1 }
            : p
        )
      );
    }
  };

  const toggleSavePost = async (postId: string): Promise<boolean> => {
    if (!user?.id) return false;
    const res = await postsApi.toggleSavePost(postId, user.id);
    return /has saved/i.test(res.data.message || '');
  };

  // ---------------- Comments & replies ----------------

  const fetchComments = async (postId: string) => {
    try {
      const res = await commentsApi.getCommentsByPost(postId, 0, 20);
      setComments((prev) => ({ ...prev, [postId]: res.data.content.map(mapComment) }));
    } catch (err) {
      console.error('Fetch comments failed:', err);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user?.id) return;
    try {
      const res = await commentsApi.createComment({ postId, userId: user.id, content });
      const newComment = mapComment(res.data);
      setComments((prev) => ({ ...prev, [postId]: [newComment, ...(prev[postId] || [])] }));
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
    } catch (err) {
      console.error('Add comment failed:', err);
    }
  };

  const deleteComment = async (commentId: string, postId: string) => {
    try {
      await commentsApi.deleteComment(commentId);
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }));
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: Math.max(0, p.comments - 1) } : p)));
    } catch (err) {
      console.error('Delete comment failed:', err);
    }
  };

  const fetchReplies = async (commentId: string) => {
    try {
      const res = await commentsApi.getRepliesByComment(commentId);
      setReplies((prev) => ({ ...prev, [commentId]: res.data.map(mapComment) }));
    } catch (err) {
      console.error('Fetch replies failed:', err);
    }
  };

  const addReply = async (postId: string, commentId: string, content: string) => {
    if (!user?.id) return;
    try {
      const res = await commentsApi.createComment({ postId, userId: user.id, content, parentCommentId: commentId });
      const newReply = mapComment(res.data);
      setReplies((prev) => ({ ...prev, [commentId]: [...(prev[commentId] || []), newReply] }));
    } catch (err) {
      console.error('Add reply failed:', err);
    }
  };

  // ---------------- Stories ----------------

  const fetchStories = async () => {
    try {
      const res = await usersApi.getStoryFeed();
      const formatted: Story[] = (res.data.data || []).map((s) => ({
        id: s.id.toString(),
        userId: s.userId.toString(),
        username: s.username,
        profilePictureUrl: s.profilePictureUrl ? toBase64Image(s.profilePictureUrl) : null,
        mediaUrl: toBase64Image(s.mediaUrl),
        caption: s.caption ?? undefined,
        storyType: s.storyType ?? undefined,
        timestamp: s.createdAt,
        expiresAt: s.expiresAt,
      }));
      setStories(formatted);
    } catch (err) {
      console.error('Fetch stories failed:', err);
    }
  };

  const addStory = async (caption: string, storyType: string, image: File) => {
    try {
      await usersApi.createStory(caption, storyType, image);
      await fetchStories();
      return true;
    } catch (err) {
      console.error('Create story failed:', err);
      return false;
    }
  };

  useEffect(() => {
    if (user?.id) fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ---------------- Notifications ----------------

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
    if (!user?.id) return;
    fetchNotifications();

    // The notification service is REST-only (no push/WebSocket channel),
    // so poll periodically to keep the unread badge reasonably fresh.
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

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

  // ---------------- Groups ----------------

  const createGroup = async (payload: { name: string; description?: string; privacy: 'PUBLIC' | 'PRIVATE' }, file?: File | null) => {
    const res = await usersApi.createGroup(payload, file);
    return res.data;
  };

  const fetchGroupById = async (groupId: string) => {
    const res = await usersApi.getGroupById(groupId);
    return res.data;
  };

  const searchGroups = useCallback(async (query: string, page = 0, size = 20) => {
    try {
      const res = await usersApi.searchGroups(query, page, size);
      setSuggestedGroups(
        (res.data.data || []).map((g) => ({
          id: g.groupId.toString(),
          name: g.groupName,
          privacy: '',
          memberCount: g.memberCount,
          groupImage: g.groupImage || '',
          currentUserRole: g.currentUserRole,
        }))
      );
    } catch (err) {
      console.error('Search groups failed:', err);
      setSuggestedGroups([]);
    }
  }, []);

  const fetchManagedGroups = useCallback(async () => {
    try {
      const res = await usersApi.getUserManagedGroups(0, 20);
      setManagedGroups(
        (res.data.data || []).map((g) => ({
          id: g.groupId.toString(),
          name: g.groupName,
          privacy: '',
          memberCount: 0,
          groupImage: g.groupImageUrl || '',
          currentUserRole: g.userRole,
        }))
      );
    } catch (err) {
      console.error('Fetch managed groups failed:', err);
    }
  }, []);

  useEffect(() => {
    if (user?.id) fetchManagedGroups();
  }, [user?.id, fetchManagedGroups]);

  const joinGroup = async (groupId: string) => {
    try {
      await usersApi.joinGroup(groupId);
      return true;
    } catch (err) {
      console.error('Join group failed:', err);
      return false;
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      await usersApi.leaveGroup(groupId);
      return true;
    } catch (err) {
      console.error('Leave group failed:', err);
      return false;
    }
  };

  // ---------------- Followers ----------------

  const fetchFollowers = useCallback(async () => {
    try {
      setFollowersLoading(true);
      setFollowersError(null);
      const res = await usersApi.getMyFollowers();
      const mapped: Follower[] = (res.data.data || []).map((f) => ({
        id: f.userId,
        fullName: f.name,
        avatarUrl: f.userProfilePic ? toBase64Image(f.userProfilePic) : undefined,
      }));
      setFollowers(mapped);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch followers';
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
        postsLoading,
        hasMorePosts,
        loadMorePosts,
        refreshFeed,
        stories,
        fetchStories,
        addStory,
        notifications,
        notificationsLoading,
        unreadNotificationsCount,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        comments,
        fetchComments,
        addComment,
        deleteComment,
        replies,
        fetchReplies,
        addReply,
        addPost,
        likePost,
        toggleSavePost,
        createGroup,
        fetchGroupById,
        managedGroups,
        suggestedGroups,
        searchGroups,
        joinGroup,
        leaveGroup,
        followers,
        fetchFollowers,
        followersLoading,
        followersError,
        clearData,
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
