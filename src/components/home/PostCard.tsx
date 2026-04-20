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
import LikesModal from "../modals/LikesModal";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    likePost,
    fetchComments,
    addComment,
    likeComment,
    comments
  } = useData();
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState<any[]>([]);
  const [liking, setLiking] = useState(false);
  const { savePost } = useData();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [saved, setSaved] = useState(false);

  const imageSrc = user?.profilePicture ? `data:image/png;base64,${user.profilePicture}` : "";
  const imageSrcPost = post?.user.profilePicture ? `data:image/png;base64,${post.user.profilePicture}` : "";

  console.log('Post Card image details ', post);

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

  const toggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    // Load comments only when opening
    if (nextState && !comments[post.id]) {
      setLoadingComments(true);
      await fetchComments(post.id);
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    await addComment(post.id, commentText);
    setCommentText("");
  };

  const toggleSaved = () => {
    setSaved(!saved);

    // if (!saved) {
    if (!user?.id) {
      console.warn('Cannot save post: no authenticated user.');
      return;
    }
    console.log('Saving post with ID:', post.id, 'for user ID:', user.id);
    savePost(post.id, user.id);
    // }
  };

  const handleLike = async () => {
    if (liking) return; // prevent spam clicks

    setLiking(true);
    await likePost(post.id);
    setLiking(false);
  };

  const fetchLikedUsers = async () => {
    try {
      // ✅ TEMP DUMMY DATA (for now)
      setLikedUsers([
        { id: 1, fullName: "John Doe", profilePicture: "" },
        { id: 2, fullName: "Jane Smith", profilePicture: "" },
        { id: 3, fullName: "Alex Perera", profilePicture: "" },
      ]);

      // 🔥 REAL API (UNCOMMENT WHEN READY)
      /*
      const res = await axiosInstance.get(
        `/api/post/${post.id}/likes`
      );
      setLikedUsers(res.data);
      */

    } catch (error) {
      console.error("Failed to fetch liked users", error);
    }
  };

  const goToProfile = () => {
    // navigate(`/profile/${post.userId}`);
    navigate(`/FriendProfile/${post.userId}`);


  };

  console.log('POst Card post details ', post);

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      {/* Post header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        {/* === Profile Section (Clickable + Mobile Responsive) === */}
        <div
          onClick={goToProfile}
          className="
      flex items-center space-x-3 cursor-pointer
      group transition-all duration-200
      active:scale-[0.97] sm:hover:scale-105
    "
        >
          {/* 🧿 Avatar with single hover ring (fixed double-circle bug) */}
          <div className="relative flex-shrink-0">
            <Avatar
              src={imageSrcPost}
              alt={post.user?.fullName || 'User'}
              size="md"
              className="
          rounded-full
          transition-transform duration-200
          sm:group-hover:ring-2 sm:group-hover:ring-sky-400
          sm:group-hover:scale-105
        "
            />
          </div>

          {/* 👤 User Info (stack neatly on mobile) */}
          <div className="leading-tight">
            <h3
              className="
          font-semibold text-gray-800
          transition-colors duration-200
          sm:group-hover:text-sky-600
          text-sm sm:text-base
        "
            >
              {post.user?.fullName || 'Unknown User'}
            </h3>
            <p className="text-xs text-gray-500">{timeAgo(post.timestamp)}</p>
          </div>
        </div>

        {/* === More Options Button === */}
        <button
          className="
      text-gray-500 hover:text-gray-700
      hover:bg-gray-100 p-1.5 rounded-full
      transition
      ml-2 sm:ml-4
    "
        >
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
            <button
              onClick={() => {
                fetchLikedUsers();
                setShowLikesModal(true);
              }}
              className="hover:underline"
            >
              {post.likes} {post.likes === 1 ? "like" : "likes"}
            </button>
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
          className={`flex-1 py-2 flex items-center justify-center space-x-1 ${post.currentUserLikeStatus ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={handleLike}
        >
          {post.currentUserLikeStatus ? (
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

        {/* <button className="flex-1 py-2 flex items-center justify-center space-x-1 text-gray-500 hover:text-gray-700">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button> */}

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
              src={imageSrc}
              alt={post.user?.fullName || 'User'}
              size="sm"
            />
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-1.5">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-1.5 flex items-center">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-transparent focus:outline-none text-sm"
                />

                <button
                  onClick={handleAddComment}
                  className="text-sky-500 text-sm ml-2"
                >
                  Post
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">

            {loadingComments && (
              <p className="text-sm text-gray-500">Loading comments...</p>
            )}

            {(comments[post.id] || []).map((c) => (
              <div key={c.id} className="flex space-x-2">
                <Avatar
                  src={(c as any).user?.profilePicture ?? (c as any).profilePicture ?? ''}
                  alt={(c as any).user?.fullName ?? (c as any).fullName ?? 'User'}
                  size="sm"
                />

                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex-1">
                  <p className="font-semibold text-gray-800">
                    {(c as any).user?.fullName ?? (c as any).fullName ?? 'Unknown User'}
                  </p>

                  <p className="text-gray-700">{c.content}</p>

                  <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">

                    {/* LIKE COMMENT */}
                    <button
                      onClick={() => likeComment(c.id, post.id)}
                      className={c.currentUserLikeStatus ? "text-red-500" : ""}
                    >
                      {c.currentUserLikeStatus ? "Unlike" : "Like"} ({c.likes})
                    </button>

                    {/* REPLY (future) */}
                    <button className="hover:text-navy-600">
                      Reply
                    </button>

                    <span>{timeAgo(c.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* VIEW ALL COMMENTS */}
            {post.comments > 3 && (
              <button
                className="text-navy-600 font-medium text-sm ml-10"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                View all {post.comments} comments
              </button>
            )}

          </div>

          {/* <div className="space-y-3"> */}
          {/* <div className="flex space-x-2">
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
            </div> */}

          {/* {post.comments > 1 && (
              <button
                className="text-navy-600 font-medium text-sm ml-10"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                View all {post.comments} comments
              </button>
            )}

          </div> */}

        </div>

      )}

      {showLikesModal && (
        <LikesModal
          users={likedUsers}
          onClose={() => setShowLikesModal(false)}
        />
      )}
    </div>



  );



};

export default PostCard;