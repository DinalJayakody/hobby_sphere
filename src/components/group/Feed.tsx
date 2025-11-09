// src/components/group/Feed.tsx
import React, { useEffect, useState } from "react";
import { Image, Send } from "lucide-react";
import { useData } from "../../context/DataContext"; // your context
import axiosInstance from "../../types/axiosInstance";

type Post = {
  id: string;
  author: string;
  content: string;
  image?: string;
  createdAt?: string;
};

const Feed: React.FC<{ groupId: string }> = ({ groupId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { createGroupPost } = useData() as any;

  useEffect(() => {
    // GET posts: /api/groups/:groupId/posts
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(`/api/groups/${groupId}/posts`);
        setPosts(res.data || []);
      } catch (err) {
        console.error(err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [groupId]);

  const onPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) return;
    const fd = new FormData();
    fd.append("content", content);
    if (file) fd.append("image", file, file.name);

    try {
      const created = await createGroupPost(groupId, fd);
      // optimistic: add to posts
      setPosts((p) => [created, ...p]);
      setContent("");
      setFile(null);
    } catch (err) {
      console.error("Post creation failed:", err);
      // show toaster
    }
  };

  return (
    <div>
      <form onSubmit={onPost} className="bg-white border border-sky-100 rounded-xl p-3 flex flex-col gap-3">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something to the group..." className="w-full bg-sky-50 p-3 rounded-md resize-none h-20" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-sky-100 cursor-pointer">
              <Image className="w-5 h-5 text-sky-500" />
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
            </label>
          </div>
          <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Send className="w-4 h-4" /> Post
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-sky-100 rounded-xl" />
            <div className="h-20 bg-sky-100 rounded-xl" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-gray-500 p-4">No posts yet — be the first to post!</div>
        ) : (
          posts.map((p) => (
            <article key={p.id} className="bg-white border border-sky-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">{p.author?.charAt(0)}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{p.author}</div>
                  <div className="text-xs text-gray-400">{new Date(p.createdAt || Date.now()).toLocaleString()}</div>
                  <p className="mt-2 text-gray-700">{p.content}</p>
                  {p.image && <img src={p.image} alt="post" className="mt-3 rounded-lg w-full object-cover" />}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
