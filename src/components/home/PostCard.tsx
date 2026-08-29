import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import Avatar from '../ui/Avatar';
import {
  Heart, MessageCircle, Bookmark, MoreHorizontal, Pencil, Trash2,
  ChevronLeft, ChevronRight, Share2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { resolveImageSrc } from '../../utils/image';
import { timeAgo } from '../../utils/time';

interface PostCardProps {
  post: Post;
  /** PostDetail opens straight into the comment thread instead of requiring a click. */
  autoExpandComments?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, autoExpandComments = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    likePost,
    sharePost,
    fetchComments,
    addComment,
    comments,
    toggleSavePost,
    fetchReplies,
    addReply,
    replies,
    savedPostIds,
    editPost,
    removePost,
    editComment,
    deleteComment,
  } = useData();
  const [liking, setLiking] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showComments, setShowComments] = useState(autoExpandComments);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [imageIndex, setImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Local optimistic mirrors of the post's mutable counters. The main feed's
  // `post` prop comes from DataContext's shared `posts` array, which the
  // like/comment/share functions below already keep in sync — but this same
  // component also renders posts from Profile's "My Posts"/"Saved Posts"
  // tabs and the standalone permalink view, which hold their own separate
  // copies of the post that those shared functions never touch. Mirroring
  // the counters locally means every surface updates immediately regardless
  // of which list supplied the prop, while still resyncing if the prop
  // itself is ever updated by its parent (e.g. a real feed refresh).
  const [localLiked, setLocalLiked] = useState(post.currentUserLikeStatus);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [localShares, setLocalShares] = useState(post.shares);
  const [localComments, setLocalComments] = useState(post.comments);

  React.useEffect(() => setLocalLiked(post.currentUserLikeStatus), [post.currentUserLikeStatus]);
  React.useEffect(() => setLocalLikes(post.likes), [post.likes]);
  React.useEffect(() => setLocalShares(post.shares), [post.shares]);
  React.useEffect(() => setLocalComments(post.comments), [post.comments]);

  const isOwnPost = user?.id?.toString() === post.userId?.toString();
  const saved = savedPostIds.has(post.id);
  const imageSrc = resolveImageSrc(user?.profilePicture ?? undefined);
  const imageSrcPost = resolveImageSrc(post?.user?.profilePicture);
  const images = (post.images || []).filter(Boolean);

  React.useEffect(() => {
    if (autoExpandComments && !comments[post.id]) {
      setLoadingComments(true);
      fetchComments(post.id).finally(() => setLoadingComments(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && !comments[post.id]) {
      setLoadingComments(true);
      await fetchComments(post.id);
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const text = commentText;
    setCommentText("");
    const ok = await addComment(post.id, text);
    if (ok) {
      setLocalComments((n) => n + 1);
    } else {
      setCommentText(text);
      toast("Couldn't post that comment. Please try again.", 'error');
    }
  };

  const toggleSaved = async () => {
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      await toggleSavePost(post.id);
    } catch (err) {
      console.error('Save/unsave failed:', err);
      toast("Couldn't update saved status. Please try again.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const wasLiked = localLiked;
    setLocalLiked(!wasLiked);
    setLocalLikes((n) => (wasLiked ? Math.max(0, n - 1) : n + 1));
    const ok = await likePost(post.id, wasLiked);
    if (!ok) {
      setLocalLiked(wasLiked);
      setLocalLikes((n) => (wasLiked ? n + 1 : Math.max(0, n - 1)));
      toast("Couldn't update like. Please try again.", 'error');
    }
    setLiking(false);
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard!', 'success');
    } catch {
      // Clipboard API can be unavailable (older browsers, insecure context) —
      // sharing still counts even if we couldn't copy the link for the user.
    }
    const ok = await sharePost(post.id);
    if (ok) {
      setLocalShares((n) => n + 1);
    } else {
      toast("Couldn't share this post. Please try again.", 'error');
    }
    setSharing(false);
  };

  const goToProfile = () => {
    navigate(isOwnPost ? '/profile' : `/FriendProfile/${post.userId}`);
  };

  const startEdit = () => {
    setEditText(post.content);
    setEditing(true);
    setMenuOpen(false);
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    const ok = await editPost(post.id, editText, post.privacy);
    if (ok) {
      setEditing(false);
    } else {
      toast("Couldn't update this post. Please try again.", 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    const ok = await removePost(post.id);
    setDeleting(false);
    if (!ok) toast("Couldn't delete this post. Please try again.", 'error');
    setMenuOpen(false);
  };

  const startEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditCommentText(content);
  };

  const saveEditComment = async () => {
    if (!editingCommentId || !editCommentText.trim()) return;
    try {
      await editComment(editingCommentId, post.id, editCommentText);
      setEditingCommentId(null);
    } catch {
      toast("Couldn't update that comment. Please try again.", 'error');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    const ok = await deleteComment(commentId, post.id);
    if (ok) {
      setLocalComments((n) => Math.max(0, n - 1));
    } else {
      toast("Couldn't delete that comment. Please try again.", 'error');
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-soft mb-4 overflow-hidden border border-border">
      {/* Post header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div
          onClick={goToProfile}
          className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer group transition-all duration-200 active:scale-[0.97]"
        >
          <Avatar
            src={imageSrcPost}
            alt={post.user?.fullName || 'User'}
            size="md"
            className="transition-transform duration-200 sm:group-hover:ring-2 sm:group-hover:ring-sky-400 flex-shrink-0"
          />
          <div className="leading-tight min-w-0">
            <h3 className="font-semibold text-ink transition-colors duration-200 sm:group-hover:text-sky-600 dark:sm:group-hover:text-sky-400 text-sm sm:text-base truncate">
              {post.user?.fullName || 'Unknown User'}
            </h3>
            <p className="text-xs text-ink-faint">{timeAgo(post.timestamp)}</p>
          </div>
        </div>

        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-ink-faint hover:text-ink hover:bg-surface-muted p-1.5 rounded-full transition ml-2 sm:ml-4"
              aria-label="Post options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 bg-surface-raised border border-border rounded-lg shadow-soft-lg py-1 z-20 w-36">
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-muted w-full text-left"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit post
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-coral-500 hover:bg-surface-muted w-full text-left disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Deleting…' : 'Delete post'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post content */}
      <div className="px-4 py-2">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full bg-surface-muted text-ink rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="text-sm text-ink-muted px-3 py-1.5 hover:bg-surface-muted rounded-lg">
                Cancel
              </button>
              <button onClick={saveEdit} className="text-sm bg-navy-600 dark:bg-sky-600 text-white px-3 py-1.5 rounded-lg hover:opacity-90">
                Save changes
              </button>
            </div>
          </div>
        ) : (
          <p className="text-ink mb-3 whitespace-pre-wrap break-words">{post.content}</p>
        )}
      </div>

      {/* Post image(s) — all images render now, not just the first */}
      {images.length > 0 && (
        <div className="relative w-full max-h-[420px] bg-surface-muted overflow-hidden flex items-center justify-center">
          <img
            src={resolveImageSrc(images[imageIndex])}
            alt="Post attachment"
            loading="lazy"
            className="max-h-[420px] w-full object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === imageIndex ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Post stats */}
      <div className="px-4 py-2 flex justify-between text-sm text-ink-muted">
        <div>
          {localLikes > 0 && (
            <span>{localLikes} {localLikes === 1 ? "like" : "likes"}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {localComments > 0 && (
            <button onClick={toggleComments} className="focus:outline-none hover:underline">
              {localComments} {localComments === 1 ? 'comment' : 'comments'}
            </button>
          )}
          {localShares > 0 && (
            <span>{localShares} {localShares === 1 ? 'share' : 'shares'}</span>
          )}
        </div>
      </div>

      {/* Post actions */}
      <div className="flex border-t border-border">
        <button
          className={`flex-1 py-2 flex items-center justify-center space-x-1 transition ${localLiked ? 'text-coral-500' : 'text-ink-muted hover:text-ink'
            }`}
          onClick={handleLike}
        >
          <Heart className={`w-5 h-5 ${localLiked ? 'fill-current' : ''}`} />
          <span>Like</span>
        </button>

        <button
          className="flex-1 py-2 flex items-center justify-center space-x-1 text-ink-muted hover:text-ink transition"
          onClick={toggleComments}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>

        <button
          className={`flex-1 py-2 flex items-center justify-center space-x-1 disabled:opacity-50 transition ${saved ? 'text-sky-600 dark:text-sky-400' : 'text-ink-muted hover:text-ink'
            }`}
          onClick={toggleSaved}
          disabled={saving}
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          <span>Save</span>
        </button>

        <button
          className="flex-1 py-2 flex items-center justify-center space-x-1 text-ink-muted hover:text-ink transition disabled:opacity-50"
          onClick={handleShare}
          disabled={sharing}
        >
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments section (expandable) */}
      {showComments && (
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center space-x-2 mb-3">
            <Avatar src={imageSrc} alt={post.user?.fullName || 'User'} size="sm" />
            <div className="flex-1 bg-surface-muted rounded-full px-4 py-1.5 flex items-center">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent focus:outline-none text-sm text-ink placeholder:text-ink-faint"
              />
              <button onClick={handleAddComment} className="text-sky-600 dark:text-sky-400 text-sm ml-2 font-medium">
                Post
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {loadingComments && (
              <p className="text-sm text-ink-muted">Loading comments...</p>
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
                const text = replyText;
                const ok = await addReply(post.id, c.id, text);
                if (ok) {
                  setLocalComments((n) => n + 1);
                  setReplyText('');
                  setOpenReplyFor(null);
                  if (!expandedReplies.has(c.id)) toggleReplies();
                } else {
                  toast("Couldn't post that reply. Please try again.", 'error');
                }
              };

              const isOwnComment = user?.id?.toString() === c.userId?.toString();
              const isEditingThis = editingCommentId === c.id;

              return (
                <div key={c.id} className="flex space-x-2">
                  <Avatar src={c.profilePictureUrl ?? ''} alt={c.fullName ?? c.username ?? 'User'} size="sm" />

                  <div className="flex-1">
                    {isEditingThis ? (
                      <div className="space-y-1.5">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows={2}
                          autoFocus
                          className="w-full bg-surface-muted text-ink rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingCommentId(null)} className="text-xs text-ink-muted hover:underline">
                            Cancel
                          </button>
                          <button onClick={saveEditComment} className="text-xs text-sky-600 dark:text-sky-400 font-medium hover:underline">
                            Save changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-surface-muted rounded-lg px-3 py-2 text-sm">
                        <p className="font-semibold text-ink">{c.fullName ?? c.username ?? 'Unknown User'}</p>
                        <p className="text-ink-muted">{c.content}</p>
                      </div>
                    )}

                    {!isEditingThis && (
                      <div className="flex items-center mt-1 space-x-3 text-xs text-ink-faint">
                        <button className="hover:text-sky-600 dark:hover:text-sky-400" onClick={() => setOpenReplyFor(isReplyOpen ? null : c.id)}>
                          Reply
                        </button>

                        {commentReplies.length > 0 && (
                          <button className="hover:text-sky-600 dark:hover:text-sky-400" onClick={toggleReplies}>
                            {isRepliesShown ? 'Hide replies' : 'View replies'}
                          </button>
                        )}

                        {isOwnComment && (
                          <>
                            <button className="hover:text-sky-600 dark:hover:text-sky-400" onClick={() => startEditComment(c.id, c.content)}>
                              Edit
                            </button>
                            <button className="hover:text-coral-500" onClick={() => handleDeleteComment(c.id)}>
                              Delete
                            </button>
                          </>
                        )}

                        <span>{timeAgo(c.createdAt)}</span>
                      </div>
                    )}

                    {isReplyOpen && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && submitReply()}
                          placeholder={`Reply to ${c.fullName ?? c.username ?? 'this comment'}...`}
                          className="flex-1 bg-surface-muted text-ink placeholder:text-ink-faint rounded-full px-3 py-1 text-xs focus:outline-none"
                          autoFocus
                        />
                        <button onClick={submitReply} className="text-sky-600 dark:text-sky-400 text-xs font-medium">
                          Send
                        </button>
                      </div>
                    )}

                    {isRepliesShown && commentReplies.length > 0 && (
                      <div className="mt-2 space-y-2 pl-4 border-l-2 border-border">
                        {commentReplies.map((r) => {
                          const isOwnReply = user?.id?.toString() === r.userId?.toString();
                          const isEditingReply = editingCommentId === r.id;
                          return (
                            <div key={r.id} className="flex space-x-2">
                              <Avatar src={r.profilePictureUrl ?? ''} alt={r.fullName ?? 'User'} size="sm" />
                              <div className="flex-1">
                                {isEditingReply ? (
                                  <div className="space-y-1.5">
                                    <textarea
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      rows={2}
                                      autoFocus
                                      className="w-full bg-surface-muted text-ink rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => setEditingCommentId(null)} className="text-[11px] text-ink-muted hover:underline">
                                        Cancel
                                      </button>
                                      <button onClick={saveEditComment} className="text-[11px] text-sky-600 dark:text-sky-400 font-medium hover:underline">
                                        Save changes
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="bg-surface-muted rounded-lg px-3 py-1.5 text-xs">
                                      <p className="font-semibold text-ink">{r.fullName ?? r.username ?? 'Unknown User'}</p>
                                      <p className="text-ink-muted">{r.content}</p>
                                    </div>
                                    {isOwnReply && (
                                      <div className="flex items-center mt-1 space-x-3 text-[11px] text-ink-faint">
                                        <button className="hover:text-sky-600 dark:hover:text-sky-400" onClick={() => startEditComment(r.id, r.content)}>
                                          Edit
                                        </button>
                                        <button className="hover:text-coral-500" onClick={() => handleDeleteComment(r.id)}>
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {!autoExpandComments && localComments > 3 && (
              <button
                className="text-sky-600 dark:text-sky-400 font-medium text-sm ml-10 hover:underline"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                View all {localComments} comments
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
