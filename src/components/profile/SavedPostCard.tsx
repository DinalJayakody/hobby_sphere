// components/profile/SavedPostCard.tsx
import { motion } from "framer-motion";
import { SavedPost } from "../../types";
// import { SavedPost } from "@/types/SavedPost";

interface Props {
  post: SavedPost;
  onClick: () => void;
}

export default function SavedPostCard({ post, onClick }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer bg-white rounded-xl shadow overflow-hidden"
    >
      {post.imageUrls?.[0] && (
        <img
          src={`data:image/png;base64,${post.imageUrls[0]}`}
          className="w-full h-56 object-cover"
        />
      )}

      <div className="p-4">
        <p className="text-gray-800 line-clamp-2">{post.content}</p>

        <div className="flex gap-4 text-sm text-gray-500 mt-3">
          <span>❤️ {post.likesCount}</span>
          <span>💬 {post.commentsCount}</span>
        </div>
      </div>
    </motion.div>
  );
}
