import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Post, Story, Notification, Follower, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
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
  /** Instantly surfaces a user's recent posts in the feed right after following them. */
  showNewlyFollowedUserPosts: (userId: string | number) => Promise<void>;
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
  removeNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  comments: { [postId: string]: Comment[] };
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string, postId: string) => Promise<void>;
  editComment: (commentId: string, postId: string, content: string) => Promise<void>;

  replies: { [commentId: string]: Comment[] };
  fetchReplies: (commentId: string) => Promise<void>;
  addReply: (postId: string, commentId: string, content: string) => Promise<void>;

  /** Fetches a single post (for permalink/detail views) and merges it into `posts` so likes/comments stay in sync with the feed. */
  fetchPostById: (postId: string) => Promise<Post | null>;
  addPost: (post: { content: string; privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY'; images?: File[] }) => Promise<boolean>;
  likePost: (postId: string) => Promise<void>;
  sharePost: (postId: string) => Promise<boolean>;
  editPost: (postId: string, content: string, privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY') => Promise<boolean>;
  removePost: (postId: string) => Promise<boolean>;
  /** Toggles the saved state and returns the resulting state (true = now saved). */
  toggleSavePost: (postId: string) => Promise<boolean>;
  savedPostIds: Set<string>;

  createGroup: (payload: { name: string; description?: string; privacy: 'PUBLIC' | 'PRIVATE' }, file?: File | null) => Promise<any>;
  fetchGroupById: (groupId: string) => Promise<any>;
  managedGroups: Group[];
  suggestedGroups: Group[];
  searchGroups: (query: string, page?: number, size?: number) => Promise<void>;
  joinGroup: (groupId: string) => Promise<'JOINED' | 'PENDING_APPROVAL' | null>;
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
  shares: p.sharesCount || 0,
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
  const { pushNotificationsEnabled } = usePreferences();

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [feedPage, setFeedPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  // Synchronous guard against concurrent feed fetches — `postsLoading` state
  // updates are batched/async, so two near-simultaneous callers (the mount
  // effect's refreshFeed and the infinite-scroll observer, which can both
  // fire before either has committed) could otherwise both read `loading as
  // false and both request the same page, appending the same posts twice.
  const feedLoadInFlight = useRef(false);

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

  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

  const clearData = () => {
    setPosts([]);
    setFeedPage(0);
    setHasMorePosts(true);
    setNotifications([]);
    setUnreadNotificationsCount(0);
    setStories([]);
    setComments({});
    setReplies({});
    setSavedPostIds(new Set());
  };

  // ---------------- Feed ----------------

  const loadFeedPage = useCallback(async (pageNum: number, replace: boolean) => {
    if (feedLoadInFlight.current) return;
    feedLoadInFlight.current = true;
    setPostsLoading(true);
    try {
      const res = await postsApi.getFeed(pageNum, 10);
      const formatted = res.data.content.map(mapPost);
      setPosts((prev) => {
        if (replace) return formatted;
        // Belt-and-suspenders: never let the same post id appear twice,
        // regardless of how a duplicate page load might slip through.
        const existingIds = new Set(prev.map((p) => p.id));
        return [...prev, ...formatted.filter((p) => !existingIds.has(p.id))];
      });
      setHasMorePosts(!res.data.last);
      setFeedPage(pageNum + 1);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      feedLoadInFlight.current = false;
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

  // Right after following someone, pull their recent posts straight into the
  // feed instead of waiting on a re-fetch of /post/feed — the backend's feed
  // cache (up to ~45s TTL) doesn't get invalidated by a follow action, so a
  // plain refetch could still serve stale, pre-follow content. Fetching that
  // one user's posts directly sidesteps the cache entirely and shows up
  // truly instantly, with no reload.
  const showNewlyFollowedUserPosts = useCallback(async (userId: string | number) => {
    try {
      const res = await postsApi.getPostsByUser(userId, 0, 3);
      const fetched = res.data.content.map(mapPost);
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newOnes = fetched.filter((p) => !existingIds.has(p.id));
        if (newOnes.length === 0) return prev;
        return [...newOnes, ...prev];
      });
    } catch (err) {
      console.error('Failed to load newly-followed user\'s posts:', err);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      refreshFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchPostById = async (postId: string): Promise<Post | null> => {
    try {
      const res = await postsApi.getPostById(postId);
      const mapped = mapPost(res.data);
      setPosts((prev) => {
        const exists = prev.some((p) => p.id === mapped.id);
        // Append rather than prepend — this is a permalink lookup, not a new
        // feed item, so it shouldn't jump to the top of Home's feed order
        // when the user navigates back there later.
        return exists ? prev.map((p) => (p.id === mapped.id ? mapped : p)) : [...prev, mapped];
      });
      return mapped;
    } catch (err) {
      console.error('Fetch post by id failed:', err);
      return null;
    }
  };

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

  // Share has no "unshare" — each call is a one-way increment, unlike the
  // like/unlike toggle above.
  const sharePost = async (postId: string): Promise<boolean> => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, shares: p.shares + 1 } : p)));
    try {
      await postsApi.sharePost(postId);
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, shares: Math.max(0, p.shares - 1) } : p)));
      return false;
    }
  };

  const toggleSavePost = async (postId: string): Promise<boolean> => {
    if (!user?.id) return false;
    const res = await postsApi.toggleSavePost(postId, user.id);
    const nowSaved = /has saved/i.test(res.data.message || '');
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(postId);
      else next.delete(postId);
      return next;
    });
    return nowSaved;
  };

  const editPost = async (postId: string, content: string, privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY') => {
    if (!user?.id) return false;
    const previous = posts.find((p) => p.id === postId);
    // Optimistic update
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, content, privacy } : p)));
    try {
      await postsApi.updatePost(postId, { userId: Number(user.id), content, privacy });
      return true;
    } catch (err) {
      console.error('Update post failed:', err);
      if (previous) setPosts((prev) => prev.map((p) => (p.id === postId ? previous : p)));
      return false;
    }
  };

  const removePost = async (postId: string) => {
    const previous = posts;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await postsApi.deletePost(postId);
      return true;
    } catch (err) {
      console.error('Delete post failed:', err);
      setPosts(previous);
      return false;
    }
  };

  // Saved-post ids are fetched once per session so PostCard can show the
  // correct saved state immediately instead of always starting unsaved.
  const fetchSavedPostIds = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await postsApi.getSavedPosts(user.id, 0, 100);
      setSavedPostIds(new Set(res.data.content.map((p) => p.id.toString())));
    } catch (err) {
      console.error('Fetch saved post ids failed:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchSavedPostIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

  // Handles both top-level comments (comments[postId]) and replies
  // (replies[parentCommentId]) — the caller doesn't need to know which.
  const deleteComment = async (commentId: string, postId: string) => {
    const wasTopLevel = (comments[postId] || []).some((c) => c.id === commentId);
    const previousComments = comments[postId];
    const previousReplies = replies;
    setComments((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
    }));
    setReplies((prev) => {
      const next: typeof prev = {};
      for (const [parentId, list] of Object.entries(prev)) {
        next[parentId] = list.filter((r) => r.id !== commentId);
      }
      return next;
    });
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: Math.max(0, p.comments - 1) } : p)));
    try {
      await commentsApi.deleteComment(commentId);
    } catch (err) {
      console.error('Delete comment failed:', err);
      if (wasTopLevel && previousComments) setComments((prev) => ({ ...prev, [postId]: previousComments }));
      setReplies(previousReplies);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
    }
  };

  const editComment = async (commentId: string, postId: string, content: string) => {
    const isTopLevel = (comments[postId] || []).some((c) => c.id === commentId);
    const previousComments = comments[postId];
    const previousReplies = replies;
    if (isTopLevel) {
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((c) => (c.id === commentId ? { ...c, content } : c)),
      }));
    } else {
      setReplies((prev) => {
        const next: typeof prev = {};
        for (const [parentId, list] of Object.entries(prev)) {
          next[parentId] = list.map((r) => (r.id === commentId ? { ...r, content } : r));
        }
        return next;
      });
    }
    try {
      await commentsApi.updateComment(commentId, content);
    } catch (err) {
      console.error('Edit comment failed:', err);
      if (isTopLevel && previousComments) setComments((prev) => ({ ...prev, [postId]: previousComments }));
      else setReplies(previousReplies);
      throw err;
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
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
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
    if (!user?.id || !pushNotificationsEnabled) return;
    fetchNotifications();

    // The notification service is REST-only (no push/WebSocket channel),
    // so poll periodically to keep the unread badge reasonably fresh.
    // Disabling "Push Notifications" in Settings pauses this entirely —
    // an immediate, real effect rather than a cosmetic toggle.
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user?.id, pushNotificationsEnabled, fetchNotifications]);

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

  // "Your Groups" should mean every group the user belongs to — owned/admin
  // AND plain-member — not just the ones they manage. The backend exposes
  // these as two separate endpoints, so merge them here (de-duped by id;
  // managed-role entries win on conflict since they carry the real role).
  const fetchManagedGroups = useCallback(async () => {
    const [managedRes, joinedRes] = await Promise.allSettled([
      usersApi.getUserManagedGroups(0, 20),
      usersApi.getGroupsJoined(0, 20),
    ]);
    if (managedRes.status === 'rejected') console.error('Fetch managed groups failed:', managedRes.reason);
    if (joinedRes.status === 'rejected') console.error('Fetch joined groups failed:', joinedRes.reason);

    const toGroup = (g: usersApi.UserManagedGroupDto): Group => ({
      id: g.groupId.toString(),
      name: g.groupName,
      privacy: '',
      memberCount: 0,
      groupImage: g.groupImageUrl || '',
      currentUserRole: g.userRole,
    });
    const byId = new Map<string, Group>();
    if (joinedRes.status === 'fulfilled') {
      (joinedRes.value.data.data || []).forEach((g) => byId.set(g.groupId.toString(), toGroup(g)));
    }
    if (managedRes.status === 'fulfilled') {
      (managedRes.value.data.data || []).forEach((g) => byId.set(g.groupId.toString(), toGroup(g)));
    }
    setManagedGroups(Array.from(byId.values()));
  }, []);

  useEffect(() => {
    if (user?.id) fetchManagedGroups();
  }, [user?.id, fetchManagedGroups]);

  // Returns the real backend status so callers can distinguish "joined
  // immediately" (public group) from "request sent, awaiting approval"
  // (private group) instead of just true/false — those need different UI.
  const joinGroup = async (groupId: string): Promise<'JOINED' | 'PENDING_APPROVAL' | null> => {
    try {
      const res = await usersApi.joinGroup(groupId);
      const status = res.data?.data?.status ?? 'JOINED';
      // Optimistic: reflect membership immediately for public groups rather
      // than waiting on a manual refetch of the discover list. A pending
      // private-group request is NOT membership, so currentUserRole is left
      // alone — the caller tracks "pending" separately.
      if (status === 'JOINED') {
        setSuggestedGroups((prev) =>
          prev.map((g) => (g.id === groupId ? { ...g, currentUserRole: g.currentUserRole ?? 'MEMBER' } : g))
        );
      }
      return status;
    } catch (err) {
      console.error('Join group failed:', err);
      return null;
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      await usersApi.leaveGroup(groupId);
      setSuggestedGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, currentUserRole: null } : g)));
      setManagedGroups((prev) => prev.filter((g) => g.id !== groupId));
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
        showNewlyFollowedUserPosts,
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
        removeNotification,
        clearAllNotifications,
        comments,
        fetchComments,
        addComment,
        deleteComment,
        editComment,
        replies,
        fetchReplies,
        addReply,
        fetchPostById,
        addPost,
        likePost,
        sharePost,
        editPost,
        removePost,
        toggleSavePost,
        savedPostIds,
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
