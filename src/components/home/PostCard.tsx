import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import Avatar from '../ui/Avatar';
import {
  Heart, MessageCircle, Bookmark, MoreHorizontal,
  Heart as HeartFilled
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

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
    comments,
    toggleSavePost,
    fetchReplies,
    addReply,
    replies,
  } = useData();
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const imageSrc = user?.profilePicture ? `data:image/png;base64,${user.profilePicture}` : "";
  const imageSrcPost = post?.user?.profilePicture ? `data:image/png;base64,${post.user.profilePicture}` : "";

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

  const toggleSaved = async () => {
    if (!user?.id || saving) return;

    setSaving(true);
    try {
      const nowSaved = await toggleSavePost(post.id);
      setSaved(nowSaved);
    } catch (err) {
      console.error('Save/unsave failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async () => {
    if (liking) return; // prevent spam clicks

    setLiking(true);
    await likePost(post.id);
    setLiking(false);
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
            loading="lazy"
            className="max-h-[350px] w-auto object-contain transition-transform duration-500 ease-in-out hover:scale-105"
          />
        </div>
      ) : null}


      {/* Post stats */}
      <div className="px-4 py-2 flex justify-between text-sm text-gray-500">
        <div>
          {post.likes > 0 && (
            <span>{post.likes} {post.likes === 1 ? "like" : "likes"}</span>
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
          className={`flex-1 py-2 flex items-center justify-center space-x-1 disabled:opacity-50 ${saved ? 'text-navy-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={toggleSaved}
          disabled={saving}
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

            {(comments[post.id] || []).map((c) => {
              const isReplyOpen = openReplyFor === c.id;
              const isRepliesShown = expandedReplies.has(c.id);
              const commentReplies = replies[c.id] || [];

              const toggleReplies = () => {
                setExpandedReplies((prev) => {
                  const next = new Set(prev);
                  if (next.has(c.id)) {
                    next.delete(c.id);
                  } else {
                    next.add(c.id);
                    if (!replies[c.id]) fetchReplies(c.id);
                  }
                  return next;
                });
              };

              const submitReply = async () => {
                if (!replyText.trim()) return;
                await addReply(post.id, c.id, replyText);
                setReplyText('');
                setOpenReplyFor(null);
                if (!expandedReplies.has(c.id)) toggleReplies();
              };

              return (
                <div key={c.id} className="flex space-x-2">
                  <Avatar
                    src={c.profilePictureUrl ?? ''}
                    alt={c.fullName ?? c.username ?? 'User'}
                    size="sm"
                  />

                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                      <p className="font-semibold text-gray-800">
                        {c.fullName ?? c.username ?? 'Unknown User'}
                      </p>
                      <p className="text-gray-700">{c.content}</p>
                    </div>

                    <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                      <button
                        className="hover:text-navy-600"
                        onClick={() => setOpenReplyFor(isReplyOpen ? null : c.id)}
                      >
                        Reply
                      </button>

                      {commentReplies.length > 0 && (
                        <button className="hover:text-navy-600" onClick={toggleReplies}>
                          {isRepliesShown ? 'Hide replies' : `View replies`}
                        </button>
                      )}

                      <span>{timeAgo(c.createdAt)}</span>
                    </div>

                    {isReplyOpen && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && submitReply()}
                          placeholder={`Reply to ${c.fullName ?? c.username ?? 'this comment'}...`}
                          className="flex-1 bg-gray-100 rounded-full px-3 py-1 text-xs focus:outline-none"
                          autoFocus
                        />
                        <button onClick={submitReply} className="text-sky-500 text-xs font-medium">
                          Send
                        </button>
                      </div>
                    )}

                    {isRepliesShown && commentReplies.length > 0 && (
                      <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-100">
                        {commentReplies.map((r) => (
                          <div key={r.id} className="flex space-x-2">
                            <Avatar src={r.profilePictureUrl ?? ''} alt={r.fullName ?? 'User'} size="sm" />
                            <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-xs flex-1">
                              <p className="font-semibold text-gray-800">{r.fullName ?? r.username ?? 'Unknown User'}</p>
                              <p className="text-gray-700">{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

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
    </div>



  );



};

export default PostCard;