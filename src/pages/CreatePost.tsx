import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useAccountSettings } from '../context/AccountSettingsContext';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { X, Image, ChevronDown } from 'lucide-react';

type Privacy = 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';

const privacyOptions: { label: string; value: Privacy; icon: string; color: string }[] = [
  { label: 'Public', value: 'PUBLIC', icon: '🌍', color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Friends Only', value: 'FRIENDS_ONLY', icon: '👥', color: 'text-sky-600 dark:text-sky-400' },
  { label: 'Private', value: 'PRIVATE', icon: '🔒', color: 'text-ink-muted' },
];

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPost } = useData();
  const { settings } = useAccountSettings();

  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<Privacy>('PUBLIC');
  const [privacyTouched, setPrivacyTouched] = useState(false);
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);

  // Seed from the user's default post privacy once settings load — but only
  // if they haven't already picked something for this post.
  React.useEffect(() => {
    if (!privacyTouched && settings?.defaultPostPrivacy) {
      setPrivacy(settings.defaultPostPrivacy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.defaultPostPrivacy]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const canPost = content.trim().length > 0 && !posting;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!canPost) return;
    setError('');
    setPosting(true);

    const success = await addPost({ content, images, privacy });

    setPosting(false);

    if (success) {
      navigate('/');
    } else {
      setError('Failed to publish your post. Please try again.');
    }
  };

  const imageSrc = `data:image/png;base64,${user.profilePicture}`;

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-navy-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-16 pb-24 md:pt-20 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-surface rounded-2xl shadow-soft border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-xl font-bold text-ink">Create Post</h1>
            <button
              className="text-ink-muted hover:text-ink hover:rotate-90 transition-transform duration-200"
              onClick={() => navigate('/')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Author info + privacy */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Avatar src={imageSrc} alt={user.fullName} size="md" />
              <div>
                <h3 className="font-semibold text-ink">{user.fullName}</h3>

                <div className="relative inline-block text-left mt-1">
                  <button
                    type="button"
                    onClick={() => setShowPrivacyMenu((prev) => !prev)}
                    className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm hover:bg-sky-100 dark:hover:bg-sky-500/20 transition"
                  >
                    <span>{privacyOptions.find((o) => o.value === privacy)?.icon}</span>
                    <span>{privacyOptions.find((o) => o.value === privacy)?.label}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  <AnimatePresence>
                    {showPrivacyMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowPrivacyMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-20 mt-1 w-36 bg-surface-raised border border-border rounded-lg shadow-soft-lg overflow-hidden"
                        >
                          {privacyOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setPrivacy(option.value);
                                setPrivacyTouched(true);
                                setShowPrivacyMenu(false);
                              }}
                              className={`flex items-center w-full px-3 py-2 text-xs hover:bg-surface-muted transition ${option.color}`}
                            >
                              <span className="mr-1.5">{option.icon}</span>
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Post content */}
          <div className="p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${user.fullName.split(' ')[0]}?`}
              className="w-full min-h-[120px] border-0 bg-transparent text-ink placeholder:text-ink-faint focus:outline-none resize-none text-lg"
              autoFocus
            />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
                {imagePreviews.map((src, index) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-transform hover:scale-110"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-sm text-coral-500 mb-2">{error}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="p-4 border-t border-border">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1 sm:space-x-2">
                <button className="relative flex items-center space-x-1 p-2 rounded-full text-ink-muted hover:bg-surface-muted transition-transform hover:scale-110">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Image className="w-6 h-6" />
                </button>
              </div>

              <Button
                variant="primary"
                disabled={!canPost}
                loading={posting}
                onClick={handleSubmit}
                className={canPost ? 'animate-pulse-glow' : ''}
              >
                {posting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePost;
