import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StoryCircle from './StoryCircle';

const Stories: React.FC = () => {
  const { stories, addStory } = useData();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const closeComposer = () => {
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
    if (success) closeComposer();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        <StoryCircle isCreateStory onClick={() => fileInputRef.current?.click()} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {stories.map(story => (
          <StoryCircle key={story.id} story={story} />
        ))}
      </div>

      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={closeComposer}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">New Story</h3>
                <button onClick={closeComposer} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {pendingPreview && (
                <img src={pendingPreview} alt="Story preview" className="w-full max-h-80 object-cover" />
              )}

              <div className="p-3 space-y-3">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption (optional)"
                  className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
                />
                <button
                  onClick={handlePost}
                  disabled={posting}
                  className="w-full bg-navy-600 hover:bg-navy-700 text-white rounded-xl py-2.5 font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {posting ? 'Sharing...' : 'Share to Story'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;
