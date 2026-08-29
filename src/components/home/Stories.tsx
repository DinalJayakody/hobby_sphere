import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ImagePlus } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StoryCircle from './StoryCircle';
import StoryViewer, { StoryGroup } from './StoryViewer';
import StoryComposer from './StoryComposer';

const Stories: React.FC = () => {
  const { stories, addStory } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  // The create-menu button lives inside the stories row's `overflow-x-auto`
  // strip. Per the CSS overflow spec, setting overflow-x to anything but
  // `visible` forces the browser to also clip overflow-y (there's no way to
  // scroll one axis and not the other) — so an absolutely-positioned dropdown
  // anchored inside that strip gets silently clipped, invisible despite being
  // in the DOM. Portaling it to `document.body` (same pattern Navbar.tsx uses
  // for its own dropdown) sidesteps the clipping entirely.
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Touch-primary devices (phones/tablets) get a real native camera via the
  // file input's `capture` attribute — no getUserMedia, no custom camera UI,
  // zero added cost. Laptops/desktops don't have a reliable equivalent (most
  // desktop browsers just ignore `capture` and open a plain file dialog), so
  // rather than ship a half-working "camera" button there, it points people
  // to their phone instead. Computed once — pointer capability doesn't
  // change mid-session.
  const isTouchDevice = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    []
  );

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!showCreateMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setShowCreateMenu(false);
    };
    // A page/list scroll would leave a fixed-position menu pointing at the
    // wrong spot — closing it is simpler and more correct than tracking
    // position on every scroll frame for a popover this short-lived.
    const handleScroll = () => setShowCreateMenu(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showCreateMenu]);

  const toggleCreateMenu = () => {
    if (showCreateMenu) {
      setShowCreateMenu(false);
      return;
    }
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) setMenuPos({ top: rect.bottom + 8, left: rect.left });
    setShowCreateMenu(true);
  };

  // Group the flat feed into one circle per author, preserving feed order —
  // tapping a circle opens the viewer starting at that author's first story
  // and lets the viewer step through the rest of their stories, then the
  // next author's, like a standard stories UI.
  const storyGroups: StoryGroup[] = useMemo(() => {
    const byUser = new Map<string, StoryGroup>();
    for (const story of stories) {
      const existing = byUser.get(story.userId);
      if (existing) {
        existing.stories.push(story);
      } else {
        byUser.set(story.userId, {
          userId: story.userId,
          username: story.username,
          profilePictureUrl: story.profilePictureUrl,
          stories: [story],
        });
      }
    }
    return Array.from(byUser.values());
  }, [stories]);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const handleTakePhoto = () => {
    setShowCreateMenu(false);
    if (!isTouchDevice) {
      toast(
        "Camera capture works best on a phone. Open HobbySphere on your mobile device to take a photo, or upload one from this computer instead.",
        'info'
      );
      return;
    }
    cameraInputRef.current?.click();
  };

  const handleUploadPhoto = () => {
    setShowCreateMenu(false);
    galleryInputRef.current?.click();
  };

  const closeComposer = () => {
    if (posting) return;
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setCaption('');
  };

  const handlePost = async () => {
    if (!pendingFile || posting) return;
    setPosting(true);
    const success = await addStory(caption, 'IMAGE', pendingFile);
    setPosting(false);
    if (success) {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
      setPendingFile(null);
      setPendingPreview(null);
      setCaption('');
      toast('Your story is live!', 'success');
    } else {
      toast("Couldn't share that story. Please try again.", 'error');
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-soft border border-border p-4 mb-4">
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        <div ref={anchorRef}>
          <StoryCircle isCreateStory onClick={toggleCreateMenu} />
        </div>

        {typeof document !== 'undefined' &&
          createPortal(
            <AnimatePresence>
              {showCreateMenu && menuPos && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: 'fixed', top: menuPos.top, left: menuPos.left }}
                  className="w-52 bg-surface-raised border border-border rounded-2xl shadow-soft-lg z-[1000] overflow-hidden py-1.5"
                >
                  <button
                    onClick={handleTakePhoto}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </span>
                    Take Photo
                  </button>
                  <button
                    onClick={handleUploadPhoto}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-500/15 flex items-center justify-center shrink-0">
                      <ImagePlus className="w-4 h-4 text-navy-600 dark:text-navy-300" />
                    </span>
                    Upload Photo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}

        {/* Hidden inputs: `capture="environment"` opens the phone's rear
            camera directly on touch devices; the plain input opens the
            normal file/gallery picker everywhere. Both feed the same
            handler — the composer below doesn't care which one was used. */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {storyGroups.map((group, index) => (
          <StoryCircle key={group.userId} story={group.stories[0]} onClick={() => setViewerGroupIndex(index)} />
        ))}
      </div>

      {viewerGroupIndex !== null && (
        <StoryViewer
          groups={storyGroups}
          startGroupIndex={viewerGroupIndex}
          onClose={() => setViewerGroupIndex(null)}
        />
      )}

      {pendingPreview && (
        <StoryComposer
          previewUrl={pendingPreview}
          caption={caption}
          onCaptionChange={setCaption}
          posting={posting}
          onDiscard={closeComposer}
          onShare={handlePost}
        />
      )}
    </div>
  );
};

export default Stories;
