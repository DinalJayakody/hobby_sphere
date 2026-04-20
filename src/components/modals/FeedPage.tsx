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
    <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/20 flex justify-center overflow-y-auto">

      <div className="w-full max-w-xl mt-6 mb-10 px-2">

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">


          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b p-3 flex items-center">
            <button
              onClick={onClose}
              className="mr-3 text-lg font-semibold hover:scale-110 transition"
            >
              ←
            </button>
            <h2 className="font-semibold">{title}</h2>
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