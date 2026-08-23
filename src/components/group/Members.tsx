import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, UserCheck } from "lucide-react";
import { getPendingJoinRequests, approveJoinRequest, rejectJoinRequest, JoinRequestDto } from "../../api/users";
import { useToast } from "../../context/ToastContext";
import Avatar from "../ui/Avatar";
import EmptyState from "../ui/EmptyState";
import { ListRowSkeleton } from "../ui/Skeleton";
import ComingSoon from "./ComingSoon";

interface MembersProps {
  groupId: string;
  isAdmin?: boolean;
}

// The backend has no "list all members" endpoint, so this tab shows the one
// piece of member management that IS real: pending join requests for
// admins to approve/reject. A full roster stays a ComingSoon placeholder.
const Members: React.FC<MembersProps> = ({ groupId, isAdmin }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<JoinRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    getPendingJoinRequests(groupId)
      .then((res) => setRequests(res.data.data || []))
      .catch((err) => console.error("Failed to load join requests:", err))
      .finally(() => setLoading(false));
  }, [groupId, isAdmin]);

  const handleDecision = async (requestId: number, approve: boolean) => {
    setBusyId(requestId);
    try {
      if (approve) await approveJoinRequest(groupId, requestId);
      else await rejectJoinRequest(groupId, requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      toast(approve ? "Request approved." : "Request rejected.", "success");
    } catch (err) {
      console.error("Failed to update join request:", err);
      toast("Couldn't update that request. Please try again.", "error");
    } finally {
      setBusyId(null);
    }
  };

  if (!isAdmin) {
    return <ComingSoon label="A full member list" />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-ink text-sm">Pending Join Requests</h4>
          <p className="text-xs text-ink-faint mt-0.5">Only shown for private groups that require approval to join.</p>
        </div>

        {loading && (
          <>
            <ListRowSkeleton />
            <ListRowSkeleton />
          </>
        )}

        {!loading && requests.length === 0 && (
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
              disabled={busyId === req.requestId}
              onClick={() => handleDecision(req.requestId, true)}
              className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50 transition"
              aria-label="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              disabled={busyId === req.requestId}
              onClick={() => handleDecision(req.requestId, false)}
              className="p-2 rounded-full bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 hover:bg-coral-100 dark:hover:bg-coral-500/20 disabled:opacity-50 transition"
              aria-label="Reject"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <ComingSoon label="A full member list" />
    </div>
  );
};

export default Members;
