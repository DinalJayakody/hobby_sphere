import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { resolveImageSrc } from "../../utils/image";
import { timeAgo } from "../../utils/time";
import {
  GroupPostDto,
  GroupPostCommentDto,
  likeGroupPost,
  unlikeGroupPost,
  getGroupPostComments,
  createGroupPostComment,
  updateGroupPostComment,
  deleteGroupPostComment,
} from "../../api/groupPosts";

interface GroupPostCardProps {
  post: GroupPostDto;
  groupId: string;
  index?: number;
}

const GroupPostCard: React.FC<GroupPostCardProps> = ({ post: initialPost, groupId, index = 0 }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState(initialPost);
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<GroupPostCommentDto[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0 && post.commentsCount > 0) {
      setLoadingComments(true);
      try {
        const res = await getGroupPostComments(groupId, post.id);
        setComments(res.data.content);
      } catch (err) {
        console.error("Failed to load group post comments:", err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleLike = async () => {
    if (liking || !user?.id) return;
    setLiking(true);
    const wasLiked = post.currentUserLikeStatus;
    setPost((p) => ({
      ...p,
      currentUserLikeStatus: !wasLiked,
      likesCount: wasLiked ? p.likesCount - 1 : p.likesCount + 1,
    }));
    try {
      if (!wasLiked) await likeGroupPost(groupId, post.id, user.id);
      else await unlikeGroupPost(groupId, post.id, user.id);
    } catch (err) {
      console.error("Group post like/unlike failed:", err);
      setPost((p) => ({
        ...p,
        currentUserLikeStatus: wasLiked,
        likesCount: wasLiked ? p.likesCount + 1 : p.likesCount - 1,
      }));
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user?.id || posting) return;
    setPosting(true);
    try {
      const res = await createGroupPostComment(groupId, post.id, { userId: user.id, content: commentText });
      setComments((prev) => [...prev, res.data]);
      setPost((p) => ({ ...p, commentsCount: p.commentsCount + 1 }));
      setCommentText("");
      if (!showComments) setShowComments(true);
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast("Couldn't post your comment. Please try again.", "error");
    } finally {
      setPosting(false);
    }
  };

  const startEdit = (c: GroupPostCommentDto) => {
    setEditingId(c.id);
    setEditText(c.content);
  };

  const saveEditComment = async (c: GroupPostCommentDto) => {
    if (!editText.trim()) return;
    const previous = c.content;
    setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, content: editText } : x)));
    setEditingId(null);
    try {
      await updateGroupPostComment(groupId, post.id, c.id, editText);
    } catch (err) {
      console.error("Failed to update comment:", err);
      setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, content: previous } : x)));
      toast("Couldn't update that comment. Please try again.", "error");
    }
  };

  const handleDeleteComment = async (c: GroupPostCommentDto) => {
    if (!window.confirm("Delete this comment?")) return;
    const previous = comments;
    setComments((prev) => prev.filter((x) => x.id !== c.id));
    setPost((p) => ({ ...p, commentsCount: Math.max(0, p.commentsCount - 1) }));
    try {
      await deleteGroupPostComment(groupId, post.id, c.id);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setComments(previous);
      setPost((p) => ({ ...p, commentsCount: p.commentsCount + 1 }));
      toast("Couldn't delete that comment. Please try again.", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 5) * 0.04 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar src="/default-avatar.svg" alt={post.fullName || post.username || "Member"} size="sm" />
        <div>
          <p className="font-semibold text-ink text-sm">{post.fullName || post.username || "Unknown member"}</p>
          <p className="text-xs text-ink-faint">{timeAgo(post.createdAt)}</p>
        </div>
      </div>
      <div className="px-4 pb-3">
        <p className="text-ink text-sm whitespace-pre-wrap break-words">{post.content}</p>
      </div>
      {post.imageUrls?.length > 0 && (
        <img src={resolveImageSrc(post.imageUrls[0])} alt="" className="w-full max-h-96 object-cover" loading="lazy" />
      )}

      {(post.likesCount > 0 || post.commentsCount > 0) && (
        <div className="px-4 pt-3 flex items-center justify-between text-xs text-ink-muted">
          <span>{post.likesCount > 0 ? `${post.likesCount} ${post.likesCount === 1 ? "like" : "likes"}` : ""}</span>
          {post.commentsCount > 0 && (
            <button onClick={toggleComments} className="hover:underline">
              {post.commentsCount} {post.commentsCount === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      )}

      <div className="flex border-t border-border mt-3">
        <button
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 text-sm transition ${
            post.currentUserLikeStatus ? "text-coral-500" : "text-ink-muted hover:text-ink"
          }`}
          onClick={handleLike}
          disabled={liking}
        >
          <Heart className={`w-4 h-4 ${post.currentUserLikeStatus ? "fill-current" : ""}`} />
          Like
        </button>
        <button
          className="flex-1 py-2 flex items-center justify-center gap-1.5 text-sm text-ink-muted hover:text-ink transition"
          onClick={toggleComments}
        >
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
      </div>

      {showComments && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {loadingComments ? (
            <p className="text-sm text-ink-muted">Loading comments...</p>
          ) : (
            comments.map((c) => {
              const isOwnComment = user?.id?.toString() === c.userId?.toString();
              return (
                <div key={c.id} className="flex items-start gap-2 group">
                  <Avatar src={resolveImageSrc(c.profilePictureUrl, "/default-avatar.svg")} alt={c.fullName || c.username || "User"} size="xs" />
                  <div className="flex-1 min-w-0">
                    {editingId === c.id ? (
                      <div className="space-y-1.5">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          className="w-full bg-surface-muted text-ink rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="text-xs text-ink-muted hover:underline">
                            Cancel
                          </button>
                          <button onClick={() => saveEditComment(c)} className="text-xs text-sky-600 dark:text-sky-400 font-medium hover:underline">
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-surface-muted rounded-2xl px-3 py-2 inline-block max-w-full">
                        <p className="text-xs font-semibold text-ink">{c.fullName || c.username || "Unknown"}</p>
                        <p className="text-sm text-ink break-words">{c.content}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-faint">
                      <span>{timeAgo(c.createdAt)}</span>
                      {isOwnComment && editingId !== c.id && (
                        <>
                          <button onClick={() => startEdit(c)} className="hover:underline hover:text-ink flex items-center gap-0.5">
                            <Pencil className="w-2.5 h-2.5" /> Edit
                          </button>
                          <button onClick={() => handleDeleteComment(c)} className="hover:underline hover:text-coral-500 flex items-center gap-0.5">
                            <Trash2 className="w-2.5 h-2.5" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="flex items-center gap-2 pt-1">
            <Avatar src={resolveImageSrc(user?.profilePicture, "/default-avatar.svg")} alt={user?.fullName || ""} size="xs" />
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddComment();
              }}
              placeholder="Write a comment..."
              className="flex-1 bg-surface-muted text-ink placeholder:text-ink-faint text-sm rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GroupPostCard;
