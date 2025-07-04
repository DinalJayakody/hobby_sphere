import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Image, MapPin, Tag, X } from 'lucide-react';

const CreatePostCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPost } = useData();
  const [content, setContent] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);


  if (!user) return null;
  const imageSrc = `data:image/png;base64,${user.profilePicture}`;
  console.log('check:', user);
  const handleSubmit = () => {
    if (!content.trim()) return;

    addPost({
      userId: String(user.id),
      user: user,
      content,
      ...(imageURL && { image: imageURL }),
      likes: 0,
      comments: 0,
      liked: false,
    });

    setContent('');
    setImageURL('');
    setShowImageInput(false);
  };

  const handleCreatePost = () => {
    if (content.trim()) {
      handleSubmit();
    } else {
      // If no content, navigate to fuller create post page
      navigate('/create');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center space-x-3 mb-3">
        <Avatar
          src={imageSrc}
          alt={user.fullName}
          size="md"
        />
        <div
          className="flex-1 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full px-4 py-2.5 text-gray-600"
          onClick={() => navigate('/create')}
        >
          {/* What's on your mind, {user.fullName.split(' ')[0]}?
           */}
           <p>{user.fullName}</p>
        </div>
      </div>

      <div className="px-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user.fullName.split(' ')[0]}?`}
          className="w-full border-0 focus:outline-none resize-none"
          rows={2}
        />

        {showImageInput && (
          <div className="relative mb-3 p-2 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
              placeholder="Enter image URL"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            />
            <button
              className="absolute right-4 top-4 text-gray-500"
              onClick={() => setShowImageInput(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {imageURL && (
          <div className="relative mb-3">
            <img
              src={imageURL}
              alt="Post preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1 text-white"
              onClick={() => setImageURL('')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className="flex items-center space-x-1 p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
            onClick={() => setShowImageInput(!showImageInput)}
          >
            <Image className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Photo</span>
          </button>

          <button className="flex items-center space-x-1 p-1.5 rounded-full text-gray-500 hover:bg-gray-100">
            <Tag className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Tag</span>
          </button>

          <button className="flex items-center space-x-1 p-1.5 rounded-full text-gray-500 hover:bg-gray-100">
            <MapPin className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Location</span>
          </button>
        </div>

        <Button
          variant={content.trim() ? 'primary' : 'secondary'}
          size="sm"
          onClick={handleCreatePost}
          disabled={!!imageURL && !content.trim()}
        >
          {content.trim() ? 'Share Post' : 'Create Post'}
        </Button>
      </div>
    </div>
  );
};

export default CreatePostCard;