import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, UserCheck, Users, Crown, Shield, MoreVertical, UserMinus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import {
  getPendingJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getGroupMembers,
  removeMember,
  updateMemberRole,
  JoinRequestDto,
  GroupMemberDto,
} from "../../api/users";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import EmptyState from "../ui/EmptyState";
import { ListRowSkeleton } from "../ui/Skeleton";

interface MembersProps {
  groupId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MEMBER" | null;
}

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Owner", ADMIN: "Admin", MEMBER: "Member" };

// Admins review join requests and manage members; only the owner
// (SUPER_ADMIN) can promote/demote admins or remove another admin.
const Members: React.FC<MembersProps> = ({ groupId, role }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [requests, setRequests] = useState<JoinRequestDto[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);

  const [members, setMembers] = useState<GroupMemberDto[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [menuUserId, setMenuUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    setRequestsLoading(true);
    getPendingJoinRequests(groupId)
      .then((res) => setRequests(res.data.data || []))
      .catch((err) => console.error("Failed to load join requests:", err))
      .finally(() => setRequestsLoading(false));
  }, [groupId, isAdmin]);

  const loadMembers = () => {
    setMembersLoading(true);
    setMembersError(null);
    getGroupMembers(groupId)
      .then((res) => setMembers(res.data.data || []))
      .catch((err) => {
        console.error("Failed to load members:", err);
        setMembersError(err?.response?.data?.message || "This group's member list is only visible to members.");
      })
      .finally(() => setMembersLoading(false));
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleDecision = async (requestId: number, approve: boolean) => {
    setBusyRequestId(requestId);
    try {
      if (approve) await approveJoinRequest(groupId, requestId);
      else await rejectJoinRequest(groupId, requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      toast(approve ? "Request approved." : "Request rejected.", "success");
      if (approve) loadMembers();
    } catch (err) {
      console.error("Failed to update join request:", err);
      toast("Couldn't update that request. Please try again.", "error");
    } finally {
      setBusyRequestId(null);
    }
  };

  const handleRemove = async (member: GroupMemberDto) => {
    if (!window.confirm(`Remove ${member.fullName || member.username} from the group?`)) return;
    setBusyUserId(member.userId);
    setMenuUserId(null);
    try {
      await removeMember(groupId, member.userId);
      setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
      toast(`${member.fullName || member.username} was removed.`, "success");
    } catch (err) {
      console.error("Failed to remove member:", err);
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast(message || "Couldn't remove this member. Please try again.", "error");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRoleChange = async (member: GroupMemberDto, newRole: "ADMIN" | "MEMBER") => {
    setBusyUserId(member.userId);
    setMenuUserId(null);
    try {
      await updateMemberRole(groupId, member.userId, newRole);
      setMembers((prev) => prev.map((m) => (m.userId === member.userId ? { ...m, role: newRole } : m)));
      toast(`${member.fullName || member.username} is now ${newRole === "ADMIN" ? "an admin" : "a member"}.`, "success");
    } catch (err) {
      console.error("Failed to update member role:", err);
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast(message || "Couldn't update this member's role. Please try again.", "error");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h4 className="font-semibold text-ink text-sm">Pending Join Requests</h4>
            <p className="text-xs text-ink-faint mt-0.5">Only shown for private groups that require approval to join.</p>
          </div>

          {requestsLoading && (
            <>
              <ListRowSkeleton />
              <ListRowSkeleton />
            </>
          )}

          {!requestsLoading && requests.length === 0 && (
            <EmptyState icon={UserCheck} title="No pending requests" subtitle="You're all caught up." />
          )}

          {requests.map((req) => (
            <motion.div
              key={req.requestId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 border-b border-border last:border-b-0"
            >
              <Avatar src="/default-avatar.svg" alt={req.fullName || req.username} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm truncate">{req.fullName || req.username}</p>
                <p className="text-xs text-ink-faint truncate">@{req.username}</p>
              </div>
              <button
                disabled={busyRequestId === req.requestId}
                onClick={() => handleDecision(req.requestId, true)}
                className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50 transition"
                aria-label="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                disabled={busyRequestId === req.requestId}
                onClick={() => handleDecision(req.requestId, false)}
                className="p-2 rounded-full bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 hover:bg-coral-100 dark:hover:bg-coral-500/20 disabled:opacity-50 transition"
                aria-label="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-ink text-sm">Members</h4>
            {!membersLoading && !membersError && (
              <p className="text-xs text-ink-faint mt-0.5">
                {members.length} {members.length === 1 ? "person" : "people"}
              </p>
            )}
          </div>
          <Users className="w-4 h-4 text-ink-faint" />
        </div>

        {membersLoading && (
          <>
            <ListRowSkeleton />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </>
        )}

        {!membersLoading && membersError && (
          <EmptyState icon={Shield} title="Members are private" subtitle={membersError} />
        )}

        {!membersLoading &&
          !membersError &&
          members.map((member) => {
            const isSelf = user?.id != null && Number(user.id) === member.userId;
            const canRemove = isAdmin && !isSelf && member.role !== "SUPER_ADMIN" && (member.role !== "ADMIN" || isSuperAdmin);
            const canChangeRole = isSuperAdmin && !isSelf && member.role !== "SUPER_ADMIN";
            return (
              <motion.div
                key={member.userId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4 border-b border-border last:border-b-0"
              >
                <Avatar src="/default-avatar.svg" alt={member.fullName || member.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm truncate">
                    {member.fullName || member.username}
                    {isSelf && <span className="text-ink-faint font-normal"> (You)</span>}
                  </p>
                  <p className="text-xs text-ink-faint truncate">@{member.username}</p>
                </div>
                <span
                  className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    member.role === "SUPER_ADMIN"
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : member.role === "ADMIN"
                      ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400"
                      : "bg-surface-muted text-ink-faint"
                  }`}
                >
                  {member.role === "SUPER_ADMIN" && <Crown className="w-3 h-3" />}
                  {member.role === "ADMIN" && <Shield className="w-3 h-3" />}
                  {ROLE_LABEL[member.role]}
                </span>

                {(canRemove || canChangeRole) && (
                  <div className="relative shrink-0">
                    <button
                      disabled={busyUserId === member.userId}
                      onClick={() => setMenuUserId((prev) => (prev === member.userId ? null : member.userId))}
                      className="p-1.5 rounded-full text-ink-faint hover:bg-surface-muted hover:text-ink transition disabled:opacity-50"
                      aria-label="Member actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuUserId === member.userId && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuUserId(null)} />
                        <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-surface-raised border border-border rounded-xl shadow-soft-lg overflow-hidden">
                          {canChangeRole && member.role === "MEMBER" && (
                            <button
                              onClick={() => handleRoleChange(member, "ADMIN")}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-muted transition text-left"
                            >
                              <ArrowUpCircle className="w-4 h-4 text-sky-500" /> Make Admin
                            </button>
                          )}
                          {canChangeRole && member.role === "ADMIN" && (
                            <button
                              onClick={() => handleRoleChange(member, "MEMBER")}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-muted transition text-left"
                            >
                              <ArrowDownCircle className="w-4 h-4 text-ink-faint" /> Remove Admin
                            </button>
                          )}
                          {canRemove && (
                            <button
                              onClick={() => handleRemove(member)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coral-600 dark:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-500/10 transition text-left"
                            >
                              <UserMinus className="w-4 h-4" /> Remove from Group
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

        {!membersLoading && !membersError && members.length === 0 && (
          <EmptyState icon={Users} title="No members yet" />
        )}
      </div>
    </div>
  );
};

export default Members;
