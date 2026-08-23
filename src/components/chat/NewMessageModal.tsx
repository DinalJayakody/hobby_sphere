import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, Users, Check } from "lucide-react";
import { searchUsers } from "../../api/Chat";
import { useChat } from "../../context/ChatContext";
import Avatar from "../ui/Avatar";
import { useToast } from "../../context/ToastContext";

interface NewMessageModalProps {
  open: boolean;
  onClose: () => void;
  onSelected?: () => void;
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({ open, onClose, onSelected }) => {
  const { openNewConversation, startGroupConversation } = useChat();
  const { toast } = useToast();
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Map<number, any>>(new Map());
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setMode("direct");
      setSelectedMembers(new Map());
      setGroupName("");
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchUsers(query.trim());
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("User search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (userId: number) => {
    setStarting(true);
    try {
      await openNewConversation(userId);
      onSelected?.();
      onClose();
    } catch (err) {
      console.error("Failed to start conversation:", err);
      toast("Couldn't start that conversation. Please try again.", "error");
    } finally {
      setStarting(false);
    }
  };

  const toggleMember = (u: any) => {
    setSelectedMembers((prev) => {
      const next = new Map(prev);
      if (next.has(u.id)) next.delete(u.id);
      else next.set(u.id, u);
      return next;
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.size === 0 || starting) return;
    setStarting(true);
    try {
      await startGroupConversation(groupName.trim(), Array.from(selectedMembers.keys()));
      onSelected?.();
      onClose();
    } catch (err) {
      console.error("Failed to create group conversation:", err);
      toast("Couldn't create that group chat. Please try again.", "error");
    } finally {
      setStarting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-raised rounded-2xl shadow-soft-lg w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <h3 className="font-semibold text-ink">{mode === "direct" ? "New Message" : "New Group"}</h3>
              <button onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode switcher */}
            <div className="flex gap-1 p-2 border-b border-border shrink-0">
              <button
                onClick={() => setMode("direct")}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${
                  mode === "direct" ? "bg-sky-500 text-white" : "text-ink-muted hover:bg-surface-muted"
                }`}
              >
                Direct
              </button>
              <button
                onClick={() => setMode("group")}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                  mode === "group" ? "bg-sky-500 text-white" : "text-ink-muted hover:bg-surface-muted"
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Group
              </button>
            </div>

            {mode === "group" && (
              <div className="px-3 pt-3 shrink-0">
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name..."
                  className="w-full px-3 py-2 bg-surface-muted text-ink placeholder:text-ink-faint rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40"
                />
                {selectedMembers.size > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Array.from(selectedMembers.values()).map((u) => (
                      <span
                        key={u.id}
                        className="flex items-center gap-1 bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 text-xs px-2 py-1 rounded-full"
                      >
                        {u.displayName || u.username}
                        <button onClick={() => toggleMember(u)} className="hover:text-coral-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by username..."
                  className="w-full pl-9 pr-3 py-2 bg-surface-muted text-ink placeholder:text-ink-faint rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-2 min-h-[3rem]">
              {loading && <div className="text-center text-sm text-ink-muted py-4 animate-pulse">Searching...</div>}
              {!loading && query.trim() && results.length === 0 && (
                <div className="text-center text-sm text-ink-faint py-6">No users found 😕</div>
              )}
              {results.map((u) => {
                const isSelected = selectedMembers.has(u.id);
                return (
                  <button
                    key={u.id}
                    disabled={starting}
                    onClick={() => (mode === "direct" ? handleSelect(u.id) : toggleMember(u))}
                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-surface-muted transition text-left disabled:opacity-50"
                  >
                    <Avatar src="/default-avatar.svg" alt={u.displayName || u.username} size="sm" status={u.onlineStatus === "ONLINE" ? "online" : "none"} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink truncate">{u.displayName || u.username}</p>
                      <p className="text-xs text-ink-muted truncate">@{u.username}</p>
                    </div>
                    {mode === "group" && isSelected && (
                      <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {mode === "group" && (
              <div className="p-3 border-t border-border shrink-0">
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedMembers.size === 0 || starting}
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:hover:bg-sky-500"
                >
                  {starting ? "Creating…" : `Create Group${selectedMembers.size > 0 ? ` (${selectedMembers.size})` : ""}`}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewMessageModal;
