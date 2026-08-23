import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Story } from "../../types";
import Avatar from "../ui/Avatar";
import { timeAgoLong as timeAgo } from "../../utils/time";

export interface StoryGroup {
  userId: string;
  username: string;
  profilePictureUrl: string | null;
  stories: Story[];
}

interface StoryViewerProps {
  groups: StoryGroup[];
  startGroupIndex: number;
  onClose: () => void;
}

const STORY_DURATION_MS = 5000;

const StoryViewer: React.FC<StoryViewerProps> = ({ groups, startGroupIndex, onClose }) => {
  const [groupIndex, setGroupIndex] = useState(startGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  const goToNextStory = () => {
    if (!group) return;
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const goToPrevStory = () => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((i) => i - 1);
      setStoryIndex(prevGroup.stories.length - 1);
    }
  };

  // Auto-advance progress bar
  useEffect(() => {
    setProgress(0);
    startRef.current = performance.now();

    const tick = (now: number) => {
      if (paused) {
        startRef.current = now - progress * STORY_DURATION_MS;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - startRef.current;
      const pct = Math.min(elapsed / STORY_DURATION_MS, 1);
      setProgress(pct);
      if (pct >= 1) {
        goToNextStory();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, storyIndex, paused]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goToNextStory();
      if (e.key === "ArrowLeft") goToPrevStory();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, storyIndex]);

  if (!group || !story) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-black flex items-center justify-center"
      >
        <div className="relative w-full h-full sm:h-[90vh] sm:max-w-md sm:rounded-2xl overflow-hidden bg-black">
          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
            {group.stories.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white"
                  style={{
                    width: i < storyIndex ? "100%" : i === storyIndex ? `${progress * 100}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-2 right-2 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={group.profilePictureUrl || "/default-avatar.svg"} alt={group.username} size="sm" border />
              <div>
                <p className="text-white text-sm font-semibold leading-tight">{group.username}</p>
                <p className="text-white/70 text-xs leading-tight">{timeAgo(story.timestamp)}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/90 hover:text-white p-1" aria-label="Close story viewer">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Media */}
          <img src={story.mediaUrl} alt={story.caption || ""} className="w-full h-full object-contain" />

          {/* Caption */}
          {story.caption && (
            <div className="absolute bottom-6 left-0 right-0 px-4 z-20 text-center">
              <p className="inline-block bg-black/40 text-white text-sm px-3 py-1.5 rounded-xl">{story.caption}</p>
            </div>
          )}

          {/* Tap zones for prev/next, hold-to-pause */}
          <div className="absolute inset-0 flex z-10">
            <button
              className="w-1/3 h-full"
              onClick={goToPrevStory}
              onMouseDown={() => setPaused(true)}
              onMouseUp={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
              aria-label="Previous story"
            />
            <div
              className="w-1/3 h-full"
              onMouseDown={() => setPaused(true)}
              onMouseUp={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            />
            <button
              className="w-1/3 h-full"
              onClick={goToNextStory}
              onMouseDown={() => setPaused(true)}
              onMouseUp={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
              aria-label="Next story"
            />
          </div>

          {/* Desktop chevrons */}
          {(groupIndex > 0 || storyIndex > 0) && (
            <button
              onClick={goToPrevStory}
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={goToNextStory}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryViewer;
