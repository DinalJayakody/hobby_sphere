const FollowersModal = ({ users, onClose }: any) => (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl w-80 p-4 max-h-[80vh] overflow-y-auto">
      <h2 className="font-bold mb-3">Followers</h2>

      {users.map((u: any) => (
        <div key={u.id} className="flex items-center gap-3 mb-2">
          <img src={u.avatarUrl} className="w-10 h-10 rounded-full" />
          <span>{u.fullName}</span>
        </div>
      ))}

      <button onClick={onClose}>Close</button>
    </div>
  </div>
);
export default FollowersModal;