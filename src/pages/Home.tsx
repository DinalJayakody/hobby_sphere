import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Navbar from "../components/layout/Navbar";
import Stories from "../components/home/Stories";
import CreatePostCard from "../components/home/CreatePostCard";
import PostCard from "../components/home/PostCard";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import { PostCardSkeleton } from "../components/ui/Skeleton";
import * as usersApi from "../api/users";
import { getTrendingPosts, PostDto } from "../api/posts";
import {
  Users,
  Bookmark,
  UsersRound,
  Home as HomeIcon,
  Compass,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const { user, loadingUser } = useAuth();
  const { posts, postsLoading, hasMorePosts, loadMorePosts, showNewlyFollowedUserPosts } = useData();
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [suggestions, setSuggestions] = useState<usersApi.UserSuggestionDto[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<PostDto[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());

  const imageSrc = user?.profilePicture ? `data:image/png;base64,${user.profilePicture}` : "/default-avatar.svg";

  // Friend suggestions — this endpoint is known to fail server-side
  // (missing Redis cache config), so a failure here is expected and just
  // means the panel stays empty rather than showing a broken error state.
  useEffect(() => {
    usersApi
      .getUserSuggestions()
      .then((res) => {
        if (res.data.success) setSuggestions(res.data.data || []);
      })
      .catch(() => setSuggestions([]));
  }, []);

  // The Trending widget only renders in the right sidebar, which is
  // desktop-only (hidden below the md breakpoint) — skip the request
  // entirely on mobile instead of fetching data nobody will see.
  useEffect(() => {
    if (!window.matchMedia('(min-width: 768px)').matches) return;
    getTrendingPosts(0, 4)
      .then((res) => setTrendingPosts(res.data.content || []))
      .catch((err) => console.error("Failed to fetch trending posts:", err));
  }, []);

  // Infinite scroll for the feed
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePosts && !postsLoading) {
          loadMorePosts();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMorePosts, postsLoading, loadMorePosts]);

  const handleFollowSuggestion = async (userId: number) => {
    try {
      await usersApi.followUser(userId);
      setFollowedIds((prev) => new Set(prev).add(userId));
      showNewlyFollowedUserPosts(userId);
    } catch (err) {
      console.error("Follow suggestion failed:", err);
    }
  };

  if (loadingUser || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-sky-50 to-sky-100 dark:from-navy-900 dark:to-surface">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-14 w-14 border-4 border-sky-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-sky-600 dark:text-sky-400 font-semibold animate-pulse">
          Loading your feed...
        </p>
      </div>
    );
  }

  const sidebarItems = [
    { icon: HomeIcon, label: "Home", action: () => navigate("/") },
    { icon: Users, label: "Friends", action: () => navigate("/FriendsPage") },
    { icon: UsersRound, label: "Groups", action: () => navigate("/GroupsPage") },
    { icon: Bookmark, label: "Saved", action: () => navigate(`/profile?tab=saved`) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 dark:from-navy-900 dark:to-surface">
      <Navbar />

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto px-2 pt-16 pb-24 md:pb-10 grid grid-cols-1 md:grid-cols-[72px_1fr_360px] gap-6">
        {/* LEFT ICON PANEL */}
        <div className="hidden md:block">
          <div className="sticky top-24">
            <div className="group flex flex-col gap-2 bg-surface/90 backdrop-blur rounded-2xl shadow-soft border border-border p-2 w-[72px] hover:w-52 transition-all duration-300 overflow-hidden">
              {sidebarItems.map(({ icon: Icon, label, action }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={action}
                  className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-500/10 text-ink-muted hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
                >
                  <Icon className="w-6 h-6 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE FEED */}
        <div className="max-w-[640px] mx-auto w-full px-1 sm:px-0">
          <Stories />
          <CreatePostCard />

          {postsLoading && posts.length === 0 ? (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          )}

          {postsLoading && posts.length > 0 && (
            <div className="text-center text-ink-faint py-4 animate-pulse text-sm">Loading more posts...</div>
          )}

          {!postsLoading && posts.length === 0 && (
            <EmptyState
              icon={Compass}
              title="Your feed is empty"
              subtitle="Follow people who share your hobbies, or create your first post to get things started."
              className="bg-surface rounded-2xl shadow-soft border border-border"
            />
          )}

          {/* Infinite scroll sentinel */}
          <div ref={loadMoreRef} className="h-4" />
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden md:block">
          <div className="sticky top-24 space-y-4">
            {/* USER CARD */}
            <div className="bg-surface rounded-2xl shadow-soft border border-border p-4 hover:shadow-soft-lg transition-shadow duration-300">
              <div className="flex items-center space-x-3">
                <img
                  src={imageSrc}
                  alt={user.fullName}
                  onClick={() => navigate("/profile")}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.svg';
                  }}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-sky-400 transition bg-surface-muted"
                  loading="lazy"
                />
                <div>
                  <h3
                    onClick={() => navigate("/profile")}
                    className="font-semibold text-ink hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                  >
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-ink-muted">@{user.username}</p>
                </div>
              </div>
            </div>

            {/* SUGGESTIONS */}
            {suggestions.length > 0 && (
              <div className="bg-surface rounded-2xl shadow-soft border border-border p-4 hover:shadow-soft-lg transition-shadow duration-300">
                <h3 className="font-semibold mb-3 text-sky-700 dark:text-sky-400">Suggestions For You</h3>

                <div className="space-y-3">
                  {suggestions.map((s) => (
                    <motion.div
                      key={s.userId}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => navigate(`/FriendProfile/${s.userId}`)}
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar
                          src={s.profilePicture ? `data:image/png;base64,${s.profilePicture}` : ''}
                          alt={s.username}
                          size="sm"
                        />
                        <div className="text-sm">
                          <p className="font-medium text-ink">{s.username}</p>
                          {s.hobby && <p className="text-xs text-ink-muted">{s.hobby}</p>}
                        </div>
                      </div>
                      <button
                        disabled={followedIds.has(s.userId)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowSuggestion(s.userId);
                        }}
                        className="text-sky-600 dark:text-sky-400 text-sm font-medium hover:underline disabled:text-ink-faint"
                      >
                        {followedIds.has(s.userId) ? 'Following' : 'Follow'}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* TRENDING */}
            {trendingPosts.length > 0 && (
              <div className="bg-surface rounded-2xl shadow-soft border border-border p-4 hover:shadow-soft-lg transition-shadow duration-300">
                <h3 className="font-semibold mb-3 text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Trending Now
                </h3>
                <div className="space-y-3">
                  {trendingPosts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/post/${p.id}`)}
                      className="cursor-pointer group"
                    >
                      <p className="text-sm text-ink group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                        {p.content}
                      </p>
                      <p className="text-xs text-ink-faint mt-0.5">
                        {p.fullName || p.username || "Someone"} · {p.likesCount} {p.likesCount === 1 ? "like" : "likes"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
