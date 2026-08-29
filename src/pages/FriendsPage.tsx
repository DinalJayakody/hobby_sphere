import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import * as usersApi from "../api/users";

const toBase64Image = (raw?: string | null) =>
  raw ? (raw.startsWith('data:') || raw.startsWith('http') ? raw : `data:image/png;base64,${raw}`) : '/default-avatar.svg';

const panels = ["Followers", "Following", "Communities"];

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { followers, fetchFollowers, followersLoading, suggestedGroups, searchGroups, joinGroup, showNewlyFollowedUserPosts } = useData();

  const [activePanel, setActivePanel] = useState<string>("Followers");
  const [search, setSearch] = useState<string>("");
  const [following, setFollowing] = useState<usersApi.UserDto[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [followedBack, setFollowedBack] = useState<Set<number>>(new Set());
  const [unfollowed, setUnfollowed] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchFollowers();
    searchGroups('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activePanel === "Following" && user?.id && following.length === 0) {
      setFollowingLoading(true);
      usersApi
        .getUserFollowing(user.id)
        .then((res) => setFollowing(res.data.data || []))
        .catch((err) => console.error("Failed to load following:", err))
        .finally(() => setFollowingLoading(false));
    }
  }, [activePanel, user?.id, following.length]);

  const handleFollowBack = async (followerId: number) => {
    setBusyId(String(followerId));
    try {
      await usersApi.followUser(followerId);
      setFollowedBack((prev) => new Set(prev).add(followerId));
      showNewlyFollowedUserPosts(followerId);
    } catch (err) {
      console.error("Follow back failed:", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleUnfollow = async (userId: number) => {
    setBusyId(String(userId));
    try {
      await usersApi.unfollowUser(userId);
      setUnfollowed((prev) => new Set(prev).add(userId));
    } catch (err) {
      console.error("Unfollow failed:", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    setBusyId(groupId);
    // joinGroup() persists PENDING/joined status onto suggestedGroups itself,
    // so no local tracking is needed here — item.raw reflects it directly.
    await joinGroup(groupId);
    setBusyId(null);
  };

  type Row = { id: string; name: string; img: string; raw: any };

  const getPanelData = (): Row[] => {
    let data: Row[] = [];
    if (activePanel === "Followers") {
      data = followers.map((f) => ({ id: String(f.id), name: f.fullName, img: toBase64Image(f.avatarUrl), raw: f }));
    } else if (activePanel === "Following") {
      data = following
        .filter((u) => !unfollowed.has(u.id))
        .map((u) => ({ id: String(u.id), name: u.fullName, img: toBase64Image(u.profilePicture), raw: u }));
    } else {
      data = suggestedGroups.map((g) => ({ id: g.id, name: g.name, img: g.groupImage ? toBase64Image(g.groupImage) : '/group-placeholder.svg', raw: g }));
    }
    return data.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  };

  const isLoading =
    (activePanel === "Followers" && followersLoading) ||
    (activePanel === "Following" && followingLoading);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-100 to-sky-200 dark:from-navy-900 dark:to-surface">
      <Navbar />

      {/* Mobile tab bar */}
      <div className="md:hidden flex gap-2 px-4 pt-16 pb-2 overflow-x-auto scrollbar-hide">
        {panels.map((panel) => (
          <button
            key={panel}
            onClick={() => {
              setActivePanel(panel);
              setSearch("");
            }}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition ${
              activePanel === panel
                ? "bg-sky-500 text-white font-semibold shadow"
                : "bg-surface/70 text-ink-muted hover:bg-sky-100 dark:hover:bg-sky-500/10"
            }`}
          >
            {panel === "Followers" ? "👥" : panel === "Following" ? "🤝" : "🏘️"}
            {panel}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop only) */}
        <aside className="hidden md:flex w-64 bg-surface/60 shadow-soft p-4 flex-col gap-4">
          <nav className="flex flex-col gap-3">
            {panels.map((panel) => (
              <button
                key={panel}
                onClick={() => {
                  setActivePanel(panel);
                  setSearch("");
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition ${
                  activePanel === panel
                    ? "bg-sky-200 dark:bg-sky-500/20 text-sky-900 dark:text-sky-300 font-semibold"
                    : "hover:bg-sky-100 dark:hover:bg-sky-500/10 text-ink-muted"
                }`}
              >
                {panel === "Followers" ? "👥" : panel === "Following" ? "🤝" : "🏘️"}
                {panel}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 flex justify-center overflow-y-auto pb-24 md:pb-6">
          <div className="w-full max-w-2xl">
            {/* Search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-xl font-bold text-sky-800 dark:text-sky-300 hidden md:block">{activePanel}</h2>
              <input
                type="text"
                placeholder={`Search ${activePanel.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-auto border border-sky-300 dark:border-border bg-surface text-ink placeholder:text-ink-faint rounded-lg px-3 py-2 sm:py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500/40"
              />
            </div>

            {/* List view */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activePanel}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-3"
              >
                {isLoading ? (
                  <div className="text-center text-ink-faint py-8 animate-pulse">Loading...</div>
                ) : getPanelData().length === 0 ? (
                  <div className="text-center text-ink-faint py-8">
                    {activePanel === "Followers" && "No followers yet."}
                    {activePanel === "Following" && "Not following anyone yet."}
                    {activePanel === "Communities" && "No groups to discover yet."}
                  </div>
                ) : (
                  getPanelData().map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
                      className="flex items-center justify-between gap-3 bg-surface/80 p-3 rounded-lg shadow-soft hover:shadow-soft-lg transition"
                    >
                      <div
                        className="flex items-center gap-3 min-w-0 cursor-pointer"
                        onClick={() =>
                          activePanel === "Communities"
                            ? navigate(`/Group/${item.id}`)
                            : navigate(`/FriendProfile/${item.id}`)
                        }
                      >
                        <img
                          src={item.img}
                          alt={item.name}
                          loading="lazy"
                          className="w-10 h-10 rounded-full border border-border shrink-0 object-cover bg-surface-muted"
                        />
                        <span className="font-medium text-ink truncate">{item.name}</span>
                      </div>

                      {activePanel === "Followers" && (
                        <button
                          disabled={followedBack.has(item.raw.id) || busyId === item.id}
                          onClick={() => handleFollowBack(item.raw.id)}
                          className="shrink-0 px-3 py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm transition-transform hover:scale-105 disabled:opacity-60"
                        >
                          {followedBack.has(item.raw.id) ? 'Following' : busyId === item.id ? '...' : 'Follow Back'}
                        </button>
                      )}

                      {activePanel === "Following" && (
                        <button
                          disabled={busyId === item.id}
                          onClick={() => handleUnfollow(item.raw.id)}
                          className="shrink-0 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition-transform hover:scale-105 disabled:opacity-60"
                        >
                          {busyId === item.id ? '...' : 'Unfollow'}
                        </button>
                      )}

                      {activePanel === "Communities" && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            disabled={
                              item.raw.currentUserRole != null ||
                              item.raw.joinRequestStatus === "PENDING" ||
                              busyId === item.id
                            }
                            onClick={() => handleJoinGroup(item.id)}
                            className={`px-3 py-1 rounded-lg text-sm transition-transform hover:scale-105 disabled:opacity-60 text-white ${
                              item.raw.joinRequestStatus === "PENDING" ? "bg-amber-500 hover:bg-amber-500" : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            {item.raw.joinRequestStatus === "PENDING"
                              ? "Pending"
                              : item.raw.currentUserRole != null
                              ? "Joined"
                              : busyId === item.id
                              ? "..."
                              : "Join"}
                          </button>
                          <button
                            onClick={() => navigate(`/Group/${item.id}`)}
                            className="px-3 py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm transition-transform hover:scale-105"
                          >
                            View
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FriendsPage;
