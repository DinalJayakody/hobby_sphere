import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  users: any[];
}

const FollowingModal: React.FC<Props> = ({ open, onClose, users }) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div
        className="bg-white w-80 max-h-[80vh] rounded-xl overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-lg">Following</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-500 text-center">No following</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 mb-3 cursor-pointer hover:bg-sky-50 p-2 rounded-lg"
              onClick={() => navigate(`/FriendProfile/${user.id}`)}
            >
              <img
                src={user.avatarUrl || "/default-avatar.png"}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{user.fullName}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowingModal;