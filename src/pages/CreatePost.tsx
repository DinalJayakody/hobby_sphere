import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { X, Image, MapPin, Tag, Globe, Lock, Users } from 'lucide-react';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPost } = useData();
  
  const [content, setContent] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [showImageInput, setShowImageInput] = useState(false);
  
  if (!user) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    addPost({
      userId: user.id,
      user: user,
      content,
      ...(imageURL && { image: imageURL })
    });
    
    navigate('/');
  };

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: Globe },
    { value: 'friends', label: 'Friends', icon: Users },
    { value: 'private', label: 'Only me', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 pt-16 pb-24 md:pt-20 md:pb-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold">Create Post</h1>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => navigate('/')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Author info */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center">
              <Avatar 
                src={user.profilePicture} 
                alt={user.name}
                size="md"
              />
              <div className="ml-3">
                <h3 className="font-semibold">{user.name}</h3>
                <div className="mt-1">
                  <select 
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="text-sm bg-gray-100 rounded-lg py-1 px-2 flex items-center focus:outline-none focus:ring-2 focus:ring-navy-300"
                  >
                    {privacyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Post content */}
          <div className="p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[120px] border-0 focus:outline-none resize-none text-lg"
              autoFocus
            />
            
            {showImageInput && !imageURL && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add an image URL
                </label>
                <input
                  type="text"
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                />
              </div>
            )}
            
            {imageURL && (
              <div className="relative mb-4">
                <img 
                  src={imageURL} 
                  alt="Post preview" 
                  className="w-full max-h-[300px] object-cover rounded-lg" 
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
          
          {/* Action buttons */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  className={`p-2 rounded-full ${showImageInput ? 'bg-gray-100 text-navy-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setShowImageInput(!showImageInput)}
                >
                  <Image className="w-6 h-6" />
                </button>
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                  <Tag className="w-6 h-6" />
                </button>
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                  <MapPin className="w-6 h-6" />
                </button>
              </div>
              
              <Button
                variant="primary"
                disabled={!content.trim()}
                onClick={handleSubmit}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;