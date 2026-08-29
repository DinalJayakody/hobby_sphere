import React, { useEffect } from "react";
import PostCard from "../home/PostCard";
import { Post } from "../../types";

interface FeedPageProps {
  posts: Post[];
  startIndex?: number;
  onClose: () => void;
  title?: string;
}

const FeedPage: React.FC<FeedPageProps> = ({
  posts,
  startIndex = 0,
  onClose,
  title = "Posts",
}) => {

  // ✅ Scroll to selected post
  useEffect(() => {
    setTimeout(() => {
      const el = document.getElementById(`feed-post-${startIndex}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [startIndex]);

  return (
    <div className="fixed inset-0 z-[60] backdrop-blur-md bg-black/20 flex justify-center overflow-y-auto">

      <div className="w-full max-w-xl mt-6 mb-10 px-2">

        <div className="bg-surface/90 backdrop-blur-lg rounded-2xl shadow-soft-lg overflow-hidden">


          {/* Header */}
          <div className="sticky top-0 bg-surface/80 backdrop-blur-md border-b border-border p-3 flex items-center">
            <button
              onClick={onClose}
              className="mr-3 text-lg font-semibold text-ink hover:scale-110 transition"
            >
              ←
            </button>
            <h2 className="font-semibold text-ink">{title}</h2>
          </div>

          {/* Feed */}
          <div>
            {posts.map((post, index) => (
              <div key={post.id} id={`feed-post-${index}`}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;