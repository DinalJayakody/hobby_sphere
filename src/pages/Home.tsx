import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Navbar from "../components/layout/Navbar";
import Stories from "../components/home/Stories";
import CreatePostCard from "../components/home/CreatePostCard";
import PostCard from "../components/home/PostCard";
import Avatar from "../components/ui/Avatar";
import * as usersApi from "../api/users";
import {
  Users,
  Bookmark,
  FileText,
  UsersRound,
  Calendar,
  Home as HomeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const { posts, postsLoading, hasMorePosts, loadMorePosts } = useData();
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [suggestions, setSuggestions] = useState<usersApi.UserSuggestionDto[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());

  let imageSrc = "";
  if (user) {
    imageSrc = `data:image/png;base64,${user.profilePicture}`;
  }

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
    } catch (err) {
      console.error("Follow suggestion failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-sky-100 to-sky-200">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-14 w-14 border-4 border-sky-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-sky-700 font-semibold animate-pulse">
          Loading your feed...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-200">
      <Navbar />

      {/* MAIN GRID */}
          <div className="max-w-7xl mx-auto px-2 pt-16 pb-24 md:pb-10 grid grid-cols-1 md:grid-cols-[72px_1fr_360px] gap-6">

        {/* LEFT ICON PANEL */}
        <div className="hidden md:block">
          <div className="sticky top-24">
            <div className="group flex flex-col gap-2 bg-white/90 backdrop-blur rounded-2xl shadow p-2 w-[72px] hover:w-52 transition-all duration-300 overflow-hidden">

              {[
                { icon: HomeIcon, label: "Home", action: () => navigate("/") },
                { icon: Users, label: "Friends", action: () => navigate("/FriendsPage") },
                { icon: UsersRound, label: "Groups", action: () => navigate("/GroupsPage") },
                { icon: FileText, label: "Pages", action: () => navigate("/Pages") },
                { icon: Bookmark, label: "Saved", action: () => navigate(`/profile/${user.id}?tab=saved`) },
                { icon: Calendar, label: "Events" },
              ].map(({ icon: Icon, label, action }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action}
                  className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-sky-50 text-gray-700 font-medium transition"
                >
                  <Icon className="w-6 h-6 text-sky-600 shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE FEED (SHIFTED LEFT) */}
        <div className="max-w-[640px] mx-auto w-full px-1 sm:px-0">
          <Stories />
          <CreatePostCard />
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}

          {postsLoading && (
            <div className="text-center text-gray-400 py-4 animate-pulse">Loading posts...</div>
          )}

          {!postsLoading && posts.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              Your feed is empty. Follow people or create your first post to get started.
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={loadMoreRef} className="h-4" />
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden md:block">
          <div className="sticky top-24 space-y-4">

            {/* USER CARD */}
            <div className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center space-x-3">
                <img
                  src={imageSrc}
                  alt={user.fullName}
                  onClick={() => navigate("/profile")}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-sky-400 transition"
                  loading="lazy"
                />
                <div>
                  <h3
                    onClick={() => navigate("/profile")}
                    className="font-semibold text-gray-900 hover:text-sky-600 cursor-pointer"
                  >
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    @{user.username}
                  </p>
                </div>
              </div>
            </div>

            {/* SUGGESTIONS */}
            {suggestions.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition-shadow duration-300">
                <h3 className="font-semibold mb-3 text-sky-700">
                  Suggestions For You
                </h3>

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
                          <p className="font-medium">{s.username}</p>
                          {s.hobby && <p className="text-xs text-gray-500">{s.hobby}</p>}
                        </div>
                      </div>
                      <button
                        disabled={followedIds.has(s.userId)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowSuggestion(s.userId);
                        }}
                        className="text-sky-600 text-sm font-medium hover:underline disabled:text-gray-400"
                      >
                        {followedIds.has(s.userId) ? 'Following' : 'Follow'}
                      </button>
                    </motion.div>
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
