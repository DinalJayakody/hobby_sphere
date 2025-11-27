import React, { useRef, useState } from 'react';
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
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY'>('PUBLIC');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);

  // const fileInputRef = useRef<HTMLInputElement>(null);  // Reference to the hidden file input
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);       // State to store selected image previews

  const [images, setSelectedFiles] = useState<File[]>([]);    // State to store actual image files for uploading


  if (!user) return null;
  const imageSrc = `data:image/png;base64,${user.profilePicture}`;
  const handleSubmit = () => {
    if (!content.trim()) return;

    addPost({
      userId: String(user.id),
      // user: user,
      content,
      images, 
      ...(imagePreviews && { image: imagePreviews }),
      likes: 0,
      comments: 0,
      liked: false,
      privacy,
    });

    setContent('');
    setImageURL('');
    setShowImageInput(false);
    setImagePreviews([]);
    setSelectedFiles([]);
  };

  const handleCreatePost = () => {
    if (content.trim()) {
      handleSubmit();
    } else {
      // If no content, navigate to fuller create post page
      navigate('/create');
    }
  };

  // Handle File Image Select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selected:', e.target.files);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const files = Array.from(e.target.files); // Convert FileList to array
        console.log('Image file selected:', files);
        setSelectedFiles(files);

        // Create image preview URLs for display
        const previews = files.map(file => URL.createObjectURL(file));
        // const previewsArray = Array.from(previews);
        setImagePreviews(previews);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
{/* 👤 User info + Privacy dropdown */}
{/* 👤 User info + Privacy dropdown */}
<div className="flex items-center justify-between mb-3 flex-wrap gap-2">
  <div className="flex items-center space-x-3">
    <Avatar src={imageSrc} alt={user.fullName} size="md" />
    <div>
      <p className="font-medium text-gray-800 text-sm sm:text-base">{user.fullName}</p>

      {/* 🔒 Compact Privacy Dropdown */}
      <div className="relative inline-block text-left mt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowPrivacyMenu((prev) => !prev);
          }}
          className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full shadow-sm hover:bg-blue-100 transition-all duration-200 ease-in-out"
        >
          {privacy === "PUBLIC" && <span className="text-[13px]">🌍</span>}
          {privacy === "FRIENDS_ONLY" && <span className="text-[13px]">👥</span>}
          {privacy === "PRIVATE" && <span className="text-[13px]">🔒</span>}
          <span>
            {privacy === "PUBLIC"
              ? "Public"
              : privacy === "FRIENDS_ONLY"
              ? "Friends Only"
              : "Private"}
          </span>
          <svg
            className="w-3 h-3 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {showPrivacyMenu && (
          <div
            className="absolute z-10 mt-1 w-32 origin-top-left bg-white border border-gray-100 rounded-lg shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-in-out"
          >
            {[
              { label: "Public", value: "PUBLIC", icon: "🌍", color: "text-green-600" },
              { label: "Friends Only", value: "FRIENDS_ONLY", icon: "👥", color: "text-blue-600" },
              { label: "Private", value: "PRIVATE", icon: "🔒", color: "text-gray-600" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  setPrivacy(option.value as 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY');
                  setShowPrivacyMenu(false);
                }}
                className={`flex items-center w-full px-2 py-1 text-[11px] sm:text-xs hover:bg-blue-50 rounded-md ${option.color} transition-all duration-150 ease-in-out`}
              >
                <span className="mr-1 text-[12px]">{option.icon}</span>
                <span className="text-gray-700">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
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
        {/* Set Image for input and save */}

        {/* <div className="relative grid grid-cols-3 gap-2 mb-4">
          {imagePreviews.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Preview ${index}`}
              className="w-full h-24 object-cover rounded"
            />
          ))}
        </div> */}



        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {imagePreviews.map((src, index) => (
            <div key={index} className="relative">
              <img
                src={src}
                alt={`Preview ${index}`}
                className="w-full h-32 object-cover rounded-lg shadow-sm"
              />

              {/* Remove button on top of image */}
              <button
                onClick={() => setImagePreviews([])}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>


        {/* {showImageInput && (
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
        )} */}

        {/* Display Image after selection */}
        {/* {imageURL && (
          <div className="relative mb-3">

            {imagePreviews.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Preview ${index}`}
              className="w-full h-24 object-cover rounded"
            />
          ))} */}
        {/* <img
              src={imageURL}
              alt="Post preview"
              className="w-full h-48 object-cover rounded-lg"
            /> */}

        {/* Button to remove the selected image */}
        {/* <button
              className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1 text-white"
              onClick={() => setImageURL('')}
            >
              <X className="w-4 h-4" />
            </button> */}
        {/* </div> */}
        {/* )} */}
      </div>

      {/* Button to Open file explorer to select */}
      <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className="relative flex items-center space-x-1 p-1.5 rounded-full text-gray-500 hover:bg-gray-100">

            <input
              type="file"
              accept="image/*" multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"

            />

            {/* // onClick={() => handleFileSelect}
            // onClick={() => setShowImageInput(!showImageInput)} */}

            {/* > */}
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
          disabled={!imagePreviews && !content.trim()}
        >
          {content.trim() ? 'Share Post' : 'Create Post'}
        </Button>
      </div>
    </div>
  );
};

export default CreatePostCard;