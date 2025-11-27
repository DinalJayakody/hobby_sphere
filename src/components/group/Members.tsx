// src/components/group/Members.tsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../types/axiosInstance";
import { useData } from "../../context/DataContext";

const Members: React.FC<{ groupId: string; isAdmin?: boolean }> = ({ groupId, isAdmin }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const { inviteMember } = useData() as any;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(`/api/groups/${groupId}/members`);
        setMembers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [groupId]);

  const onInvite = async () => {
    if (!inviteEmail) return alert("Enter email");
    try {
      await inviteMember(groupId, inviteEmail);
      alert("Invite sent");
      setInviteEmail("");
    } catch (err) {
      console.error(err);
      alert("Invite failed");
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-xl border border-sky-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800">Members ({members.length})</h4>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <input className="px-2 py-1 border rounded" placeholder="email@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              <button onClick={onInvite} className="px-3 py-1 bg-sky-600 text-white rounded">Invite</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="animate-pulse h-24 bg-sky-100 rounded" />
        ) : members.length === 0 ? (
          <div className="text-gray-500">No members yet</div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {members.map((m: any) => (
              <div key={m.id} className="flex flex-col items-center text-center">
                <img src={m.avatar || "/default-avatar.png"} alt={m.fullName} className="w-12 h-12 rounded-full object-cover" />
                <div className="text-xs mt-1">{m.firstName || m.username}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
