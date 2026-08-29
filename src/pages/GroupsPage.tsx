import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  PlusCircle,
  Compass,
} from "lucide-react";
import { useData } from "../context/DataContext";
import Navbar from "../components/layout/Navbar";

const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { managedGroups, suggestedGroups, searchGroups, joinGroup } = useData();

  // Debounced search-as-you-type against the discover list
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchGroups(search);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, searchGroups]);

  const handleGroupClick = (groupId: string) => navigate(`/Group/${groupId}`);

  const handleJoin = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setJoiningId(groupId);
    // joinGroup() itself optimistically marks the group's joinRequestStatus
    // as PENDING (or currentUserRole as MEMBER for public groups) on
    // suggestedGroups, so that state survives independently of this refetch.
    await joinGroup(groupId);
    setJoiningId(null);
    // Refresh so a publicly-joined group moves from "Discover" into "Your Groups".
    await Promise.all([searchGroups(search)]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 dark:from-navy-900 dark:to-surface">
      <Navbar />

      <div className="flex flex-col md:flex-row pt-16 md:pt-8">
        {/* LEFT SIDEBAR */}
        <aside className="w-full md:w-64 bg-surface/70 backdrop-blur-lg border-r border-sky-100 dark:border-border p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 text-sky-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search groups"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-full bg-sky-50 dark:bg-surface-muted text-ink placeholder:text-ink-faint border border-sky-200 dark:border-border text-sm focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40 outline-none"
            />
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 font-medium">
              <Compass className="w-4 h-4" /> Discover
            </div>

            <button
              onClick={() => navigate("/CreateGroup")}
              className="flex items-center gap-2 px-3 py-2 text-sky-600 dark:text-sky-400 mt-3 hover:text-sky-700 dark:hover:text-sky-300 transition-transform hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" /> Create New Group
            </button>
          </nav>

          {/* Groups you're part of */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink-muted mb-2">
              Your Groups
            </h2>
            {managedGroups.length === 0 ? (
              <p className="text-xs text-ink-faint">You haven't joined any groups yet.</p>
            ) : (
              <div className="space-y-2">
                {managedGroups.map((g) => (
                  <motion.div
                    key={g.id}
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-2 cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-500/10 p-2 rounded-lg transition-colors"
                    onClick={() => handleGroupClick(g.id)}
                  >
                    <img
                      src={
                        g.groupImage
                          ? `data:image/png;base64,${g.groupImage}`
                          : "/group-placeholder.svg"
                      }
                      alt={g.name}
                      className="w-9 h-9 rounded-md object-cover shrink-0 bg-surface-muted"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{g.name}</p>
                      {g.currentUserRole && (
                        <p className="text-xs text-ink-faint">{g.currentUserRole}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="flex-1 p-4 sm:p-5 pb-24 md:pb-5">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-ink">Discover Groups</h2>
            </div>

            {suggestedGroups.length === 0 ? (
              <div className="bg-surface/70 border border-sky-100 dark:border-border rounded-2xl p-8 text-center text-ink-muted">
                {search ? `No groups matching "${search}"` : 'No groups to discover yet.'}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {suggestedGroups.map((group, index) => {
                  const alreadyIn = group.currentUserRole != null;
                  const isPending = group.joinRequestStatus === "PENDING";
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-surface/80 border border-sky-100 dark:border-border rounded-2xl shadow-soft hover:shadow-soft-lg transition-all overflow-hidden cursor-pointer"
                      onClick={() => handleGroupClick(group.id)}
                    >
                      <img
                        src={
                          group.groupImage
                            ? `data:image/png;base64,${group.groupImage}`
                            : "/group-placeholder.svg"
                        }
                        alt={group.name}
                        loading="lazy"
                        className="w-full h-36 sm:h-40 object-cover bg-surface-muted"
                      />
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-ink mb-1">
                          {group.name}
                        </h3>
                        <p className="text-xs text-ink-faint">
                          {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                        </p>
                        <button
                          className={`mt-3 w-full font-medium text-sm rounded-lg py-2 transition disabled:opacity-60 ${
                            isPending
                              ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400"
                              : "bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-border text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20"
                          }`}
                          disabled={alreadyIn || isPending || joiningId === group.id}
                          onClick={(e) => handleJoin(e, group.id)}
                        >
                          {isPending ? 'Request Pending' : alreadyIn ? 'Joined' : joiningId === group.id ? 'Joining...' : 'Join Group'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GroupsPage;
