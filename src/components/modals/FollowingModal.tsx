import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

export interface FollowingRow {
  id: string | number;
  fullName: string;
  username?: string;
  avatarUrl?: string;
  /**
   * Does the VIEWER (current logged-in user, not the profile owner) follow
   * this person? Omit when every row is implicitly true — e.g. your own
   * Following list, where every entry is by definition someone you follow.
   * On a friend's Following list this varies per row and should be passed
   * explicitly so the button reflects your own relationship to each person.
   */
  followStatus?: boolean;
}

interface Props {
  open: boolean;
  users: FollowingRow[];
  loading?: boolean;
  onClose: () => void;
  /** Omit both to render the list read-only (no action button). */
  onUnfollow?: (userId: string | number) => Promise<void>;
  onFollow?: (userId: string | number) => Promise<void>;
}

const FollowingModal: React.FC<Props> = ({ open, users, loading, onClose, onUnfollow, onFollow }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => (u.fullName || "").toLowerCase().includes(q) || (u.username || "").toLowerCase().includes(q)
    );
  }, [users, query]);

  if (!open) return null;

  const handleToggle = async (u: FollowingRow) => {
    if (busyId != null) return;
    const isFollowed = u.followStatus !== false;
    const action = isFollowed ? onUnfollow : onFollow;
    if (!action) return;
    setBusyId(u.id);
    try {
      await action(u.id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-md bg-surface-raised rounded-t-3xl sm:rounded-2xl shadow-soft-lg overflow-hidden flex flex-col max-h-[85vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Following"
        >
          <div className="w-10 h-1.5 bg-border rounded-full mx-auto mt-3 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 pt-3 sm:pt-4 pb-3 border-b border-border shrink-0">
            <h3 className="text-lg font-semibold text-ink">Following</h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-ink-faint hover:text-ink hover:bg-surface-muted rounded-full p-1.5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          {users.length > 5 && (
            <div className="px-4 sm:px-5 py-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search following"
                  className="w-full pl-9 pr-3 py-2 bg-surface-muted text-ink placeholder:text-ink-faint rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40"
                />
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto px-2 sm:px-3 pb-3">
            {loading ? (
              <div className="py-10 text-center text-sm text-ink-muted animate-pulse">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-ink-faint">
                {query ? "No matches found" : "Not following anyone yet"}
              </div>
            ) : (
              filtered.map((u) => {
                const isFollowed = u.followStatus !== false;
                const canAct = isFollowed ? !!onUnfollow : !!onFollow;
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-muted transition"
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                      onClick={() => {
                        onClose();
                        navigate(`/FriendProfile/${u.id}`);
                      }}
                    >
                      <img
                        src={u.avatarUrl || "/default-avatar.svg"}
                        alt={u.fullName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/default-avatar.svg";
                        }}
                        className="w-11 h-11 rounded-full object-cover bg-surface-muted shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate">{u.fullName}</p>
                        {u.username && <p className="text-sm text-ink-muted truncate">@{u.username}</p>}
                      </div>
                    </div>

                    {canAct && (
                      <button
                        onClick={() => handleToggle(u)}
                        disabled={busyId === u.id}
                        className={`shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-60 ${
                          isFollowed
                            ? "bg-surface-muted text-ink hover:bg-coral-50 hover:text-coral-600 dark:hover:bg-coral-500/10"
                            : "bg-sky-500 text-white hover:bg-sky-600"
                        }`}
                      >
                        {busyId === u.id ? "..." : isFollowed ? "Unfollow" : "Follow"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FollowingModal;
