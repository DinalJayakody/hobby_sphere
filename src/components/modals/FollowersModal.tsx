import React, { useEffect, useMemo, useRef, useState } from "react";

type Follower = {
  id: string | number;
  avatarUrl?: string;
  fullName: string;
  username?: string;
};

type Props = {
  followers?: Follower[];
  onClose: () => void;
  onUnfollow?: (user: Follower) => Promise<void> | void;
};

const FollowersModal: React.FC<Props> = ({ followers = [], onClose, onUnfollow }) => {
  const [query, setQuery] = useState("");
  const [localList, setLocalList] = useState<Follower[]>(Array.isArray(followers) ? followers : []);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setLocalList(Array.isArray(followers) ? followers : []), [followers]);

  // close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // click outside to close
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const list = Array.isArray(localList) ? localList : [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        (u.fullName || "").toLowerCase().includes(q) ||
        ((u.username || "") as string).toLowerCase().includes(q)
    );
  }, [localList, query]);

  const handleUnfollow = async (user: Follower) => {
    // optimistic UI: remove locally first
    setLocalList((prev) => prev.filter((u) => u.id !== user.id));
    try {
      if (onUnfollow) await onUnfollow(user);
    } catch (err) {
      // rollback on error
      setLocalList((prev) => [user, ...prev]);
      console.error("Unfollow failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />

      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden z-10"
        role="dialog"
        aria-modal="true"
        aria-label="Followers"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Followers</h3>
          <button
            onClick={onClose}
            aria-label="Close followers"
            className="text-gray-500 hover:text-gray-700 rounded-full p-1"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50">
          <div className="relative">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search followers"
              className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-100 focus:border-sky-300 text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No followers found</div>
          ) : (
            <ul>
              {filtered.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatarUrl || `/api/avatar/${u.id}`}
                      alt={u.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-medium">{u.fullName}</div>
                      <div className="text-xs text-gray-500">@{u.username || u.id}</div>
                    </div>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleUnfollow(u)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition"
                      aria-label={`Unfollow ${u.fullName}`}
                    >
                      Unfollow
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer (optional) */}
        <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
