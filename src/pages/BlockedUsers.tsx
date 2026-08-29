import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UserX } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../context/ToastContext";
import * as usersApi from "../api/users";
import { resolveImageSrc } from "../utils/image";

const BlockedUsers: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blocked, setBlocked] = useState<usersApi.BlockedUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    usersApi
      .getBlockedUsers(0, 100)
      .then((res) => setBlocked(res.data.data || []))
      .catch((err) => console.error("Failed to load blocked users:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleUnblock = async (userId: number) => {
    setBusyId(userId);
    const previous = blocked;
    setBlocked((prev) => prev.filter((u) => u.id !== userId));
    try {
      await usersApi.unblockUser(userId);
    } catch (err) {
      console.error("Unblock failed:", err);
      setBlocked(previous);
      toast("Couldn't unblock this user. Please try again.", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200 dark:from-navy-900 dark:to-surface">
      <Navbar />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-16 pb-24 md:py-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/Settings")}
            className="p-2 rounded-full hover:bg-sky-100 dark:hover:bg-sky-500/10 text-ink-muted hover:text-ink transition"
            aria-label="Back to Settings"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-ink">Blocked Accounts</h1>
        </div>

        <div className="bg-surface rounded-2xl shadow-soft border border-border p-4 sm:p-5">
          {loading ? (
            <div className="text-center text-ink-faint py-8 animate-pulse">Loading...</div>
          ) : blocked.length === 0 ? (
            <EmptyState
              icon={UserX}
              title="No blocked accounts"
              subtitle="Accounts you block won't be able to see your profile or contact you."
            />
          ) : (
            <AnimatePresence initial={false}>
              <div className="flex flex-col gap-2">
                {blocked.map((u, index) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03 }}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-500/10 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={resolveImageSrc(u.profilePicture, "/default-avatar.svg")}
                        alt={u.fullName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/default-avatar.svg";
                        }}
                        className="w-11 h-11 rounded-full object-cover bg-surface-muted shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">{u.fullName}</p>
                        <p className="text-sm text-ink-muted truncate">@{u.username}</p>
                      </div>
                    </div>
                    <button
                      disabled={busyId === u.id}
                      onClick={() => handleUnblock(u.id)}
                      className="shrink-0 px-3 py-1.5 bg-surface-muted text-ink text-sm font-medium rounded-lg hover:bg-coral-50 hover:text-coral-600 dark:hover:bg-coral-500/10 transition disabled:opacity-60"
                    >
                      {busyId === u.id ? "..." : "Unblock"}
                    </button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockedUsers;
