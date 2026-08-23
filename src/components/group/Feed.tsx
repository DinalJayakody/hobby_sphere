import React, { useEffect, useState } from "react";
import { Image, X, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getGroupPosts, createGroupPost, GroupPostDto } from "../../api/groupPosts";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { PostCardSkeleton } from "../ui/Skeleton";
import GroupPostCard from "./GroupPostCard";

interface FeedProps {
  groupId: string;
  /** Non-members can't post (and the backend rejects listing too, even for public groups you haven't joined). */
  isMember?: boolean;
}

const Feed: React.FC<FeedProps> = ({ groupId, isMember }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<GroupPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGroupPosts(groupId)
      .then((res) => setPosts(res.data.content))
      .catch((err) => console.error("Failed to load group posts:", err))
      .finally(() => setLoading(false));
  }, [groupId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePost = async () => {
    if (!content.trim() || !user?.id || posting) return;
    setPosting(true);
    try {
      const res = await createGroupPost(groupId, { userId: Number(user.id), content }, images);
      setPosts((prev) => [res.data, ...prev]);
      setContent("");
      previews.forEach((p) => URL.revokeObjectURL(p));
      setPreviews([]);
      setImages([]);
    } catch (err) {
      console.error("Failed to create group post:", err);
      toast("Couldn't publish that post. Please try again.", "error");
    } finally {
      setPosting(false);
    }
  };

  if (!isMember) {
    return (
      <EmptyState
        icon={Users}
        title="Join this group to see its posts"
        subtitle="Only members can view and post in this group's feed."
        className="bg-surface border border-border rounded-2xl"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Avatar src={user?.profilePicture ? `data:image/png;base64,${user.profilePicture}` : ''} alt={user?.fullName || ''} size="sm" />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with the group..."
            rows={2}
            className="flex-1 bg-transparent text-ink placeholder:text-ink-faint focus:outline-none resize-none text-sm"
          />
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
            {previews.map((src, i) => (
              <div key={src} className="relative">
                <img src={src} alt="" className="w-full h-20 object-cover rounded-lg" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <label className="relative flex items-center gap-1.5 text-ink-muted hover:text-ink p-1.5 rounded-full hover:bg-surface-muted cursor-pointer transition">
            <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Image className="w-4 h-4" />
            <span className="text-xs">Photo</span>
          </label>
          <Button size="sm" onClick={handlePost} loading={posting} disabled={!content.trim()}>
            Post
          </Button>
        </div>
      </div>

      {loading && <PostCardSkeleton />}

      {!loading && posts.length === 0 && (
        <EmptyState
          icon={Users}
          title="No posts yet"
          subtitle="Be the first to share something with this group."
          className="bg-surface border border-border rounded-2xl"
        />
      )}

      {posts.map((post, index) => (
        <GroupPostCard key={post.id} post={post} groupId={groupId} index={index} />
      ))}
    </div>
  );
};

export default Feed;
