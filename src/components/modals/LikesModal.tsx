import React from "react";
import Avatar from "../ui/Avatar";

const LikesModal = ({ users = [], onClose }: any) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">

      {/* Overlay click */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="
        relative w-full sm:max-w-md
        bg-white/90 backdrop-blur-lg
        rounded-t-3xl sm:rounded-2xl
        shadow-2xl
        p-4 sm:p-5
        max-h-[80vh]
        animate-[slideUp_0.35s_ease]
      ">

        {/* Drag handle (mobile UX) */}
        <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            ❤️ Liked by
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Users List */}
        <div className="overflow-y-auto max-h-[55vh] pr-1 space-y-3">

          {users.length > 0 ? (
            users.map((u: any) => (
              <div
                key={u.id}
                className="
                  flex items-center justify-between
                  p-2 rounded-xl
                  hover:bg-gray-100
                  transition
                "
              >
                <div className="flex items-center space-x-3">
                  
                  {/* Avatar with gradient ring */}
                  <div className="p-[2px] rounded-full bg-gradient-to-tr from-pink-500 to-orange-400">
                    <Avatar
                      src={
                        u.profilePicture
                          ? `data:image/png;base64,${u.profilePicture}`
                          : ""
                      }
                      size="sm"
                      alt={u.fullName}
                      className="rounded-full bg-white"
                    />
                  </div>

                  {/* Name */}
                  <span className="text-sm font-medium text-gray-800">
                    {u.fullName}
                  </span>
                </div>

                {/* Optional follow button */}
                <button className="
                  text-xs px-3 py-1 rounded-full
                  bg-gray-200 hover:bg-gray-300
                  transition
                ">
                  View
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <span className="text-3xl mb-2">💔</span>
              <p className="text-sm">No likes yet</p>
            </div>
          )}

        </div>

      </div>

      {/* Animation style */}
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LikesModal;