import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import * as usersApi from "../api/users";

const toBase64Image = (raw?: string | null) =>
  raw ? (raw.startsWith('data:') || raw.startsWith('http') ? raw : `data:image/png;base64,${raw}`) : '/default-avatar.png';

const panels = ["Followers", "Following", "Communities"];

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { followers, fetchFollowers, followersLoading, suggestedGroups, searchGroups, joinGroup } = useData();

  const [activePanel, setActivePanel] = useState<string>("Followers");
  const [search, setSearch] = useState<string>("");
  const [following, setFollowing] = useState<usersApi.UserDto[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [followedBack, setFollowedBack] = useState<Set<number>>(new Set());
  const [unfollowed, setUnfollowed] = useState<Set<number>>(new Set());
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

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
    const success = await joinGroup(groupId);
    if (success) setJoinedIds((prev) => new Set(prev).add(groupId));
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
      data = suggestedGroups.map((g) => ({ id: g.id, name: g.name, img: g.groupImage ? toBase64Image(g.groupImage) : '/group-placeholder.png', raw: g }));
    }
    return data.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  };

  const isLoading =
    (activePanel === "Followers" && followersLoading) ||
    (activePanel === "Following" && followingLoading);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-100 to-sky-200">
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
                : "bg-white/70 text-gray-700 hover:bg-sky-100"
            }`}
          >
            {panel === "Followers" ? "👥" : panel === "Following" ? "🤝" : "🏘️"}
            {panel}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop only) */}
        <aside className="hidden md:flex w-64 bg-white/60 shadow-md p-4 flex-col gap-4">
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
                    ? "bg-sky-200 text-sky-900 font-semibold"
                    : "hover:bg-sky-100 text-gray-700"
                }`}
              >
                {panel === "Followers" ? "👥" : panel === "Following" ? "🤝" : "🏘️"}
                {panel}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 flex justify-center overflow-y-auto pb-20 md:pb-6">
          <div className="w-full max-w-2xl">
            {/* Search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-xl font-bold text-sky-800 hidden md:block">{activePanel}</h2>
              <input
                type="text"
                placeholder={`Search ${activePanel.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-auto border border-sky-300 rounded-lg px-3 py-2 sm:py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
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
                  <div className="text-center text-gray-400 py-8 animate-pulse">Loading...</div>
                ) : getPanelData().length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
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
                      className="flex items-center justify-between gap-3 bg-white/80 p-3 rounded-lg shadow hover:shadow-md transition"
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
                          className="w-10 h-10 rounded-full border shrink-0 object-cover"
                        />
                        <span className="font-medium text-gray-800 truncate">{item.name}</span>
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
                            disabled={joinedIds.has(item.id) || item.raw.currentUserRole != null || busyId === item.id}
                            onClick={() => handleJoinGroup(item.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-transform hover:scale-105 disabled:opacity-60"
                          >
                            {joinedIds.has(item.id) || item.raw.currentUserRole != null ? 'Joined' : busyId === item.id ? '...' : 'Join'}
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
