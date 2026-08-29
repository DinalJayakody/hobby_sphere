import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import * as usersApi from "../api/users";
import { resolveImageSrc } from "../utils/image";

const PAGE_SIZE = 12;

const SuggestionCardSkeleton: React.FC = () => (
  <div className="bg-surface rounded-2xl shadow-soft border border-border p-4 flex flex-col items-center">
    <Skeleton className="w-16 h-16 rounded-full mb-3" />
    <Skeleton className="h-3.5 w-20 mb-2" />
    <Skeleton className="h-3 w-14 mb-4" />
    <Skeleton className="h-9 w-full rounded-xl" />
  </div>
);

interface SuggestionCardProps {
  suggestion: usersApi.UserSuggestionDto;
  isFollowing: boolean;
  isBusy: boolean;
  onFollow: (userId: number) => void;
  onOpenProfile: (userId: number) => void;
}

// Memoized: this page can render dozens of these as pages load in, and only
// the one card a user actually taps "Follow" on should ever re-render.
// forwardRef is required, not optional, here — AnimatePresence's
// mode="popLayout" (used below so remaining cards reflow smoothly when one
// is removed) attaches a ref to each child to measure it while it exits; a
// plain memoized function component can't receive that ref, which silently
// breaks the reflow and logs a "components cannot be given refs" warning.
const SuggestionCard = React.memo(
  React.forwardRef<HTMLDivElement, SuggestionCardProps>(
    ({ suggestion, isFollowing, isBusy, onFollow, onOpenProfile }, ref) => (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.25 }}
      className="bg-surface rounded-2xl shadow-soft border border-border p-4 flex flex-col items-center text-center hover:shadow-soft-lg transition-shadow"
    >
      <button onClick={() => onOpenProfile(suggestion.userId)} className="mb-3">
        <Avatar src={resolveImageSrc(suggestion.profilePicture)} alt={suggestion.username} size="lg" />
      </button>
      <button
        onClick={() => onOpenProfile(suggestion.userId)}
        className="font-semibold text-ink hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate max-w-full"
      >
        {suggestion.username}
      </button>
      {suggestion.hobby && (
        <span className="mt-1 text-xs text-ink-muted bg-surface-muted px-2 py-0.5 rounded-full truncate max-w-full">
          🎯 {suggestion.hobby}
        </span>
      )}
      <button
        disabled={isFollowing || isBusy}
        onClick={() => onFollow(suggestion.userId)}
        className={`mt-4 w-full py-2 rounded-xl text-sm font-medium transition disabled:opacity-70 ${
          isFollowing
            ? "bg-surface-muted text-ink-faint"
            : "bg-navy-600 dark:bg-sky-600 hover:bg-navy-700 dark:hover:bg-sky-500 text-white"
        }`}
      >
        {isFollowing ? "Following" : isBusy ? "…" : "Follow"}
      </button>
    </motion.div>
    )
  )
);
SuggestionCard.displayName = "SuggestionCard";

const Suggestions: React.FC = () => {
  const navigate = useNavigate();
  const { showNewlyFollowedUserPosts } = useData();
  const { toast } = useToast();

  const [suggestions, setSuggestions] = useState<usersApi.UserSuggestionDto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());
  const [busyId, setBusyId] = useState<number | null>(null);

  // The endpoint returns a flat list with no total-count field, so "fewer
  // than requested came back" is the only reliable end-of-list signal —
  // the same convention already used for search pagination elsewhere.
  const loadPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const res = await usersApi.getUserSuggestions(pageNum, PAGE_SIZE);
        const fetched = res.data.data || [];
        setSuggestions((prev) => (pageNum === 0 ? fetched : [...prev, ...fetched]));
        setHasMore(fetched.length === PAGE_SIZE);
        setPage(pageNum + 1);
      } catch (err) {
        console.error("Failed to load suggestions:", err);
        if (pageNum === 0) {
          toast("Couldn't load suggestions right now. Please try again later.", "error");
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    loadPage(page);
  }, [loading, hasMore, page, loadPage]);

  const sentinelRef = useInfiniteScroll({ loading, hasMore, onLoadMore: loadMore });

  const handleFollow = async (userId: number) => {
    setBusyId(userId);
    try {
      await usersApi.followUser(userId);
      setFollowedIds((prev) => new Set(prev).add(userId));
      showNewlyFollowedUserPosts(userId);
      // Let the "Following" state register for a beat before the card
      // leaves the grid, instead of it vanishing the instant it's tapped.
      setTimeout(() => {
        setSuggestions((prev) => prev.filter((s) => s.userId !== userId));
      }, 700);
    } catch (err) {
      console.error("Follow failed:", err);
      toast("Couldn't follow that user. Please try again.", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 dark:from-navy-900 dark:to-surface">
      <Navbar />
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-16 pb-24 md:pt-20 md:pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Suggestions For You</h1>
          <p className="text-ink-muted text-sm mt-1">
            People who share your hobbies and might be nearby.
          </p>
        </div>

        {initialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SuggestionCardSkeleton key={i} />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No suggestions right now"
            subtitle="Check back later, or follow a few people to help us find more matches for you."
            className="bg-surface rounded-2xl shadow-soft border border-border"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {suggestions.map((s) => (
                <SuggestionCard
                  key={s.userId}
                  suggestion={s}
                  isFollowing={followedIds.has(s.userId)}
                  isBusy={busyId === s.userId}
                  onFollow={handleFollow}
                  onOpenProfile={(id) => navigate(`/FriendProfile/${id}`)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!initialLoading && hasMore && (
          <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
            {loading && <span className="text-sm text-ink-faint animate-pulse">Loading more…</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
