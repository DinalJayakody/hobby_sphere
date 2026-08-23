import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useAccountSettings } from '../../context/AccountSettingsContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Image, X, ChevronDown } from 'lucide-react';

const PRIVACY_OPTIONS = [
  { label: "Public", value: "PUBLIC", icon: "🌍", color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Friends Only", value: "FRIENDS_ONLY", icon: "👥", color: "text-sky-600 dark:text-sky-400" },
  { label: "Private", value: "PRIVATE", icon: "🔒", color: "text-ink-muted" },
] as const;

const CreatePostCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPost } = useData();
  const { settings } = useAccountSettings();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY'>('PUBLIC');
  const [privacyTouched, setPrivacyTouched] = useState(false);
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);

  React.useEffect(() => {
    if (!privacyTouched && settings?.defaultPostPrivacy) {
      setPrivacy(settings.defaultPostPrivacy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.defaultPostPrivacy]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [images, setSelectedFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);

  if (!user) return null;
  const imageSrc = `data:image/png;base64,${user.profilePicture}`;
  const currentPrivacy = PRIVACY_OPTIONS.find((p) => p.value === privacy)!;

  const handleSubmit = async () => {
    if (!content.trim() || posting) return;

    setPosting(true);
    const success = await addPost({ content, privacy, images });
    setPosting(false);

    if (success) {
      setContent('');
      imagePreviews.forEach((src) => URL.revokeObjectURL(src));
      setImagePreviews([]);
      setSelectedFiles([]);
    } else {
      toast("Couldn't publish your post. Please try again.", 'error');
    }
  };

  const handleCreatePost = () => {
    if (content.trim()) {
      handleSubmit();
    } else {
      navigate('/create');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    setSelectedFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="bg-surface rounded-2xl shadow-soft border border-border p-4 mb-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <Avatar src={imageSrc} alt={user.fullName} size="md" />
          <div>
            <p className="font-medium text-ink text-sm sm:text-base">{user.fullName}</p>

            <div className="relative inline-block text-left mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrivacyMenu((prev) => !prev);
                }}
                className="inline-flex items-center space-x-1 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full shadow-sm hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-all duration-200 ease-in-out"
              >
                <span className="text-[13px]">{currentPrivacy.icon}</span>
                <span>{currentPrivacy.label}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showPrivacyMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowPrivacyMenu(false)} />
                  <div className="absolute z-20 mt-1 w-36 origin-top-left bg-surface-raised border border-border rounded-lg shadow-soft-lg">
                    {PRIVACY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrivacy(option.value);
                          setPrivacyTouched(true);
                          setShowPrivacyMenu(false);
                        }}
                        className={`flex items-center w-full px-3 py-2 text-xs hover:bg-surface-muted rounded-lg ${option.color}`}
                      >
                        <span className="mr-1.5">{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user.fullName.split(' ')[0]}?`}
          className="w-full border-0 bg-transparent text-ink placeholder:text-ink-faint focus:outline-none resize-none"
          rows={2}
        />

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4 mt-2">
            {imagePreviews.map((src, index) => (
              <div key={index} className="relative">
                <img src={src} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg shadow-sm" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-transform hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="relative flex items-center space-x-1 p-1.5 rounded-full text-ink-muted hover:bg-surface-muted transition">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Image className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Photo</span>
          </button>
        </div>

        <Button
          variant={content.trim() ? 'primary' : 'secondary'}
          size="sm"
          onClick={handleCreatePost}
          loading={posting}
        >
          {content.trim() ? 'Share Post' : 'Create Post'}
        </Button>
      </div>
    </div>
  );
};

export default CreatePostCard;
