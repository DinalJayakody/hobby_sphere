import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Send } from 'lucide-react';

interface StoryComposerProps {
  previewUrl: string;
  caption: string;
  onCaptionChange: (value: string) => void;
  posting: boolean;
  onDiscard: () => void;
  onShare: () => void;
}

// Full-screen story preview/editor — reuses the exact same responsive frame
// as StoryViewer (full-bleed on mobile, a centered 9:16-ish card on desktop)
// so composing and viewing a story feel like the same surface. Deliberately
// does not include music/timer/alt-text controls — this app has no use for
// them yet, and the two actions that matter (discard vs. share) stay the
// clear, obvious choice.
const StoryComposer: React.FC<StoryComposerProps> = ({
  previewUrl,
  caption,
  onCaptionChange,
  posting,
  onDiscard,
  onShare,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !posting) onDiscard();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onDiscard, posting]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-black flex items-center justify-center"
      >
        <div className="relative w-full h-full sm:h-[90vh] sm:max-w-sm sm:rounded-2xl overflow-hidden bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
            <button
              onClick={onDiscard}
              disabled={posting}
              className="text-white/90 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <p className="text-white text-sm font-semibold">Your Story</p>
            <div className="w-9" />
          </div>

          {/* Image */}
          <img src={previewUrl} alt="Story preview" className="w-full h-full object-cover" />

          {/* Caption input, overlaid near the bottom like the final story render */}
          <div className="absolute bottom-24 left-0 right-0 px-4 z-20">
            <input
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="Add a caption…"
              maxLength={200}
              disabled={posting}
              className="w-full bg-black/40 backdrop-blur-sm text-white placeholder:text-white/60 text-sm font-medium text-center rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-70"
            />
          </div>

          {/* Actions */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pt-8 bg-gradient-to-t from-black/70 to-transparent flex gap-3">
            <button
              onClick={onDiscard}
              disabled={posting}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl py-3 transition disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={onShare}
              disabled={posting}
              className="flex-1 bg-gradient-to-r from-navy-600 to-sky-500 hover:from-navy-700 hover:to-sky-600 text-white font-semibold rounded-xl py-3 transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {posting ? 'Sharing…' : 'Share to Story'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryComposer;
