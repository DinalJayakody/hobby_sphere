import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import * as usersApi from "../api/users";
import * as postsApi from "../api/posts";
import { mapPost } from '../context/DataContext';
import { resolveImageSrc } from '../utils/image';

import {
  Settings as SettingsIcon, Heart, MessageCircle, Tag as TagIcon,
} from 'lucide-react';

import { Post } from '../types';
import FollowersModal from "../components/modals/FollowersModal";
import FollowingModal from "../components/modals/FollowingModal";
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import FeedPage from '../components/modals/FeedPage';

const TABS = ['posts', 'saved', 'tagged'] as const;
type Tab = typeof TABS[number];

const Profile: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showNewlyFollowedUserPosts } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Note: this page always shows the logged-in user's own data, regardless
  // of a :username route param — the backend has no "view another user's
  // followers" endpoint, so there's no other-profile mode to support here.
  // FriendProfile.tsx is the page for viewing someone else's profile.

  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(currentUser?.followersCount ?? 0);
  // Following-count display override: user.followingCount comes from
  // AuthContext and isn't refetched on every unfollow, so track the delta
  // locally to keep the badge live without needing to touch AuthContext's
  // public API for something this small.
  const [followingCountDelta, setFollowingCountDelta] = useState(0);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [showFeed, setShowFeed] = useState(false);

  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedPage, setSavedPage] = useState(0);
  const [savedHasMore, setSavedHasMore] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);

  // ================= FETCH POSTS =================
  // These hooks must run unconditionally on every render (React's rules of
  // hooks) — `currentUser` can turn null after this page has already
  // mounted (e.g. a 401 triggers AuthContext's logout() while the user is
  // sitting on their own profile), and bailing out with an early `return`
  // before hooks would change how many hooks run between renders, which
  // React surfaces as a hard crash ("rendered fewer hooks than expected")
  // rather than a graceful redirect. The actual guard is deferred to the
  // JSX return at the bottom, after every hook below has run.
  useEffect(() => {
    if (!currentUser?.id) return;
    // Reuses DataContext's own PostDto -> Post mapping instead of a
    // hand-rolled copy — the previous inline version silently dropped
    // `shares`, `currentUserLikeStatus`, and `privacy` (this endpoint
    // returns the same complete PostDto as the main feed, so there was no
    // reason those fields were ever missing here), which meant the Like
    // button never reflected a post's real liked state and the share count
    // never rendered when viewed from this tab.
    postsApi
      .getPostsByUser(currentUser.id)
      .then((res) => setUserPosts(res.data.content.map(mapPost)))
      .catch((err) => console.error('Failed to fetch user posts:', err));
  }, [currentUser?.id]);

  // Author display info (name/avatar) resolved for saved posts — see note
  // below. Keyed by userId and kept for the component's lifetime so the same
  // author is never re-fetched across pages of saved posts.
  const savedAuthorCacheRef = useRef<Map<number, { fullName: string; profilePicture: string | null }>>(
    new Map()
  );

  // ================= FETCH SAVED POSTS =================
  const fetchSavedPosts = async (page: number) => {
    const userId = currentUser?.id;
    if (!userId || savedLoading || !savedHasMore) return;

    try {
      setSavedLoading(true);
      const res = await postsApi.getSavedPosts(userId, page, 10);
      const validItems = (res.data.content || []).filter((p) => p && p.id);

      // Unlike the main feed / own-posts endpoints, /api/savePost/{userId}
      // doesn't enrich its response with the author's name/avatar — it only
      // returns their raw userId, which is why this screen was showing
      // "Unknown User" and a placeholder image for every saved post. Resolve
      // each *distinct* author once (most pages reuse the same few authors),
      // fetched in parallel and cached for the rest of this screen's life —
      // never one request per post, and never re-fetched for an author
      // already resolved on an earlier page.
      const uncachedIds = Array.from(new Set<number>(validItems.map((p) => p.userId))).filter(
        (id) => id != null && !savedAuthorCacheRef.current.has(id)
      );

      if (uncachedIds.length > 0) {
        const results = await Promise.allSettled(uncachedIds.map((id) => usersApi.getUserById(id)));
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            const u = result.value.data;
            savedAuthorCacheRef.current.set(uncachedIds[i], {
              fullName: u.fullName,
              profilePicture: u.profilePicture,
            });
          }
        });
      }

      // This endpoint also doesn't say whether the current user has liked
      // each post (unlike the feed / own-posts endpoints, which do) — ask
      // the small dedicated per-post endpoint for just this page's posts,
      // in parallel, so the Like button starts in the right state instead
      // of always defaulting to "not liked".
      const likeResults = await Promise.allSettled(
        validItems.map((p) => postsApi.isPostLikedByUser(p.id, userId))
      );

      const posts: Post[] = validItems.map((p, i) => {
        const author = savedAuthorCacheRef.current.get(p.userId);
        const likeResult = likeResults[i];
        return {
          id: p.id.toString(),
          userId: p.userId.toString(),
          user: {
            id: p.userId.toString(),
            fullName: author?.fullName || 'Unknown User',
            profilePicture: resolveImageSrc(author?.profilePicture),
          },
          content: p.content,
          images: p.imageUrls || [],
          likes: p.likesCount,
          comments: p.commentsCount,
          shares: p.sharesCount || 0,
          currentUserLikeStatus: likeResult.status === 'fulfilled' ? likeResult.value.data : false,
          privacy: (p.privacy as 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY') || 'PUBLIC',
          timestamp: p.createdAt,
        };
      });

      setSavedPosts((prev) => {
        const newPosts = posts.filter((p) => !prev.some((existing) => existing.id === p.id));
        return [...prev, ...newPosts];
      });

      if (posts.length < 10) {
        setSavedHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch saved posts", err);
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    if (showFeed) {
      setTimeout(() => {
        const el = document.getElementById(`post-${selectedIndex}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showFeed, selectedIndex]);

  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedPosts(savedPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPage, activeTab]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "saved" || tab === "tagged") {
      setActiveTab(tab);
    } else {
      setActiveTab("posts");
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "saved") {
      setSavedPosts([]);
      setSavedPage(0);
      setSavedHasMore(true);
    }
  }, [activeTab]);

  const loadMoreSaved = useCallback(() => {
    if (!savedLoading && savedHasMore) {
      setSavedPage((prev) => prev + 1);
    }
  }, [savedLoading, savedHasMore]);

  const savedObserverRef = useInfiniteScroll({
    loading: savedLoading,
    hasMore: savedHasMore,
    onLoadMore: loadMoreSaved,
  });

  // ================= FETCH FOLLOWERS =================
  // Note: the backend only exposes the CURRENT user's own follower list —
  // there's no endpoint to view another user's followers.
  const loadFollowers = async () => {
    setShowFollowers(true);
    setFollowersLoading(true);
    try {
      const res = await usersApi.getMyFollowers();
      const normalized = (res.data.data || []).map((item) => ({
        id: item.userId,
        avatarUrl: item.userProfilePic ? resolveImageSrc(item.userProfilePic) : undefined,
        fullName: item.name,
        followStatus: item.followStatus,
      }));

      setFollowersList(normalized);
      setFollowersCount(normalized.length);
    } catch (err) {
      console.error("Failed to load followers:", err);
    } finally {
      setFollowersLoading(false);
    }
  };

  // A follower is someone who follows ME — following/unfollowing them here
  // changes MY following relationship to them, not my follower count, so
  // these only ever flip that follower's `followStatus` flag in place.
  const handleFollowBack = async (userId: string | number) => {
    await usersApi.followUser(userId);
    setFollowersList((prev) => prev.map((f) => (f.id === userId ? { ...f, followStatus: true } : f)));
    setFollowingCountDelta((d) => d + 1);
    showNewlyFollowedUserPosts(userId);
  };

  const handleUnfollowFromFollowers = async (userId: string | number) => {
    await usersApi.unfollowUser(userId);
    setFollowersList((prev) => prev.map((f) => (f.id === userId ? { ...f, followStatus: false } : f)));
    setFollowingCountDelta((d) => d - 1);
  };

  const loadFollowing = async () => {
    if (!currentUser?.id) return;
    setShowFollowing(true);
    setFollowingLoading(true);
    try {
      const res = await usersApi.getUserFollowing(currentUser.id);
      const normalized = (res.data.data || []).map((u) => ({
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        avatarUrl: u.profilePicture ? resolveImageSrc(u.profilePicture) : undefined,
      }));
      setFollowingList(normalized);
    } catch (e) {
      console.error("Failed to load following:", e);
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleUnfollowFromFollowing = async (userId: string | number) => {
    await usersApi.unfollowUser(userId);
    setFollowingList((prev) => prev.filter((u) => u.id !== userId));
    setFollowingCountDelta((d) => d - 1);
    // If this person also follows the viewer, reflect the changed
    // relationship if their row happens to be visible in Followers too.
    setFollowersList((prev) => prev.map((f) => (f.id === userId ? { ...f, followStatus: false } : f)));
  };

  // Safe to bail out here — every hook above has already run this render,
  // so an early return from this point on can't desync hook call order.
  if (!currentUser) return null;
  const user = currentUser;
  const imageSrc = resolveImageSrc(user.profilePicture);

  const renderGrid = (posts: Post[]) => (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {posts.map((post, index) => (
        <div
          key={post.id}
          onClick={() => {
            setFeedPosts(posts);
            setSelectedIndex(index);
            setShowFeed(true);
          }}
          className="aspect-square bg-surface-muted relative cursor-pointer group overflow-hidden rounded-sm sm:rounded-lg animate-fade-in"
        >
          <img
            src={resolveImageSrc(post.images?.[0], "/no-image.svg")}
            loading="lazy"
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-4 text-white transition-opacity">
            <div className="flex items-center">
              <Heart className="w-5 mr-1" />
              {post.likes}
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-5 mr-1" />
              {post.comments}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white dark:from-navy-900 dark:to-surface">
      <Navbar />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-16 pb-24 md:pb-10">
        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface rounded-2xl shadow-soft border border-border overflow-hidden mb-6"
        >
          <div className="h-28 sm:h-40 bg-gradient-to-r from-indigo-500 to-sky-400" />

          <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row">
            <img
              src={imageSrc || '/default-avatar.svg'}
              alt={user.fullName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.svg';
              }}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-4 border-surface -mt-12 sm:-mt-16 object-cover shadow-lg bg-surface-muted flex-shrink-0"
            />

            <div className="flex-1 md:ml-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h1 className="text-xl font-bold text-ink">{user.fullName}</h1>
                  <p className="text-ink-faint">@{user.username}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate("/ProfileEdit")}>
                    Edit Profile
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate("/Settings")} aria-label="Settings">
                    <SettingsIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-ink-muted mb-4 mt-3 sm:mt-0">
                <span className="font-bold text-ink">Bio:</span> {user.bio}
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4">
                <p className="text-ink-muted">📍 {user.location || ""}</p>
                <p className="text-ink-muted">🎯 {user.mainHobby || ""}</p>
              </div>

              {/* COUNTS */}
              <div className="flex gap-6 mt-3 text-sm">
                <div className="text-ink-muted">
                  <b className="text-ink">{userPosts.length}</b> Posts
                </div>

                <button className="mr-6 mb-2 text-left hover:text-sky-600 dark:hover:text-sky-400 transition-colors" onClick={loadFollowers}>
                  <span className="font-semibold text-ink">{followersCount}</span>{" "}
                  <span className="text-ink-muted">Followers</span>
                </button>
                <button className="mb-2 text-left hover:text-sky-600 dark:hover:text-sky-400 transition-colors" onClick={loadFollowing}>
                  <span className="font-semibold text-ink">{Math.max(0, (user.followingCount ?? 0) + followingCountDelta)}</span>{" "}
                  <span className="text-ink-muted">Following</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= TABS ================= */}
          <div className="border-t border-border flex">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-sky-400'
                  : 'text-ink-faint hover:text-ink-muted'
                  }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ================= POSTS GRID ================= */}
        {activeTab === 'posts' && (
          userPosts.length > 0 ? renderGrid(userPosts) : (
            <EmptyState icon={MessageCircle} title="No posts yet" subtitle="Share your first post to see it here." />
          )
        )}

        {/* ================= SAVED ================= */}
        {activeTab === 'saved' && (
          <>
            {savedPosts.length > 0 ? renderGrid(savedPosts) : !savedLoading && (
              <EmptyState icon={Heart} title="No saved posts" subtitle="Posts you save will show up here." />
            )}
            <div ref={savedObserverRef} className="h-4" />
          </>
        )}

        {/* ================= TAGGED ================= */}
        {activeTab === 'tagged' && (
          <EmptyState icon={TagIcon} title="No Tagged Posts" subtitle="Posts you're tagged in will show up here." />
        )}

        {/* ================= MODALS ================= */}
        {showFollowers && (
          <FollowersModal
            followers={followersList}
            loading={followersLoading}
            onClose={() => setShowFollowers(false)}
            onFollowBack={handleFollowBack}
            onUnfollow={handleUnfollowFromFollowers}
          />
        )}

        {showFollowing && (
          <FollowingModal
            users={followingList}
            loading={followingLoading}
            onClose={() => setShowFollowing(false)}
            open={showFollowing}
            onUnfollow={handleUnfollowFromFollowing}
          />
        )}

        {showFeed && (
          <FeedPage
            posts={feedPosts}
            startIndex={selectedIndex}
            onClose={() => setShowFeed(false)}
            title={activeTab === "saved" ? "Saved Posts" : "Posts"}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
