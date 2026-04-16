const SavedPostModal = ({ post, onClose }: any) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white w-[90%] max-w-5xl h-[80vh] rounded-xl overflow-hidden flex">

        {/* Left - Image */}
        <div className="w-1/2 bg-black flex items-center justify-center">
          <img
            src={post.images?.[0]}
            alt=""
            className="object-contain max-h-full"
          />
        </div>

        {/* Right - Details */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b font-semibold">
            {post.user?.fullName}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <p>{post.content}</p>

            {/* Comments */}
            {post.comments?.map((c: any) => (
              <p key={c.id}>
                <span className="font-semibold">
                  {c.user.username}
                </span>{" "}
                {c.text}
              </p>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 border-t flex justify-between">
            <span>{post.likesCount} Likes</span>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SavedPostModal;