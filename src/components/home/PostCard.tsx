import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import Avatar from '../ui/Avatar';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ChevronDown, ChevronUp, Heart as HeartFilled
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();
    const { user } = useAuth();
  const { likePost } = useData();
  const [showComments, setShowComments] = useState(false);
  const [saved, setSaved] = useState(false);

  const imageSrc = user?.profilePicture ? `data:image/png;base64,${user.profilePicture}` : "";

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return postTime.toLocaleDateString();
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const toggleSaved = () => {
    setSaved(!saved);
  };

  const handleLike = () => {
    likePost(post.id);
  };

  const goToProfile = () => {
    navigate(`/profile/${post.user.username}`);
  };

         console.log('POst Card post details ',  post.content);

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      {/* Post header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center space-x-3" onClick={goToProfile}>
          <Avatar
            src={imageSrc}
            alt={post.user?.fullName || "User"}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{post.user.fullName}</h3>
            <p className="text-xs text-gray-500">{timeAgo(post.timestamp)}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>


      {/* Post image */}
<div className="px-4 py-2">
  <p className="text-gray-800 mb-3">{post.content}</p>
</div>

{/* Post image */}
{Array.isArray(post.images) && post.images.length > 0 && typeof post.images[0] === "string" ? (
  <div className="relative w-full max-h-[350px] bg-gray-100 rounded-2xl overflow-hidden shadow-md flex items-center justify-center">
    <img
      src={
        post.images[0].startsWith("data:image")
          ? post.images[0]
          : `data:image/png;base64,${post.images[0]}`
      }
      alt="Post"
      className="max-h-[350px] w-auto object-contain transition-transform duration-500 ease-in-out hover:scale-105"
    />
  </div>
) : null}


      {/* Post stats */}
      <div className="px-4 py-2 flex justify-between text-sm text-gray-500">
        <div>
          {post.likes > 0 && (
            <span>{post.likes} {post.likes === 1 ? 'like' : 'likes'}</span>
          )}
        </div>
        <div>
          {post.comments > 0 && (
            <button onClick={toggleComments} className="focus:outline-none">
              {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      </div>

      {/* Post actions */}
      <div className="flex border-t border-gray-100">
        <button
          className={`flex-1 py-2 flex items-center justify-center space-x-1 ${post.liked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={handleLike}
        >
          {post.liked ? (
            <HeartFilled className="w-5 h-5 fill-current" />
          ) : (
            <Heart className="w-5 h-5" />
          )}
          <span>Like</span>
        </button>

        <button
          className="flex-1 py-2 flex items-center justify-center space-x-1 text-gray-500 hover:text-gray-700"
          onClick={toggleComments}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>

        <button className="flex-1 py-2 flex items-center justify-center space-x-1 text-gray-500 hover:text-gray-700">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>

        <button
          className={`flex-1 py-2 flex items-center justify-center space-x-1 ${saved ? 'text-navy-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={toggleSaved}
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          <span>Save</span>
        </button>
      </div>

      {/* Comments section (expandable) */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <Avatar
              src={post.user.profilePicture}
              alt={post.user.fullName}
              size="sm"
            />
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-1.5">
              <input
                type="text"
                placeholder="Write a comment..."
                className="w-full bg-transparent focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex space-x-2">
              <Avatar
                src="https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg"
                alt="Jane Smith"
                size="sm"
              />
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex-1">
                <p className="font-semibold text-gray-800">Jane Smith</p>
                <p className="text-gray-700">
                  This looks amazing! Love the colors and composition.
                </p>
                <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                  <button className="hover:text-navy-600">Like</button>
                  <button className="hover:text-navy-600">Reply</button>
                  <span>2h</span>
                </div>
              </div>
            </div>

            {post.comments > 1 && (
              <button
                className="text-navy-600 font-medium text-sm ml-10"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                View all {post.comments} comments
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;