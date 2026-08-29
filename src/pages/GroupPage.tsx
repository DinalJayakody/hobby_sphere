// src/pages/GroupPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { motion } from "framer-motion";
import { useData } from "../context/DataContext";
import AdminPanel, { GroupTab } from "../components/group/AdminPanel";
import Tabs from "../components/group/Tabs";
import Hero from "../components/group/Hero";
import * as usersApi from "../api/users";
import { useToast } from "../context/ToastContext";

/**
 * GroupPage (route: /Group/:groupId)
 * - fetches initial group object and role (admin/member)
 * - renders Admin UI if role === 'admin', otherwise member UI
 */

type Group = {
  id: string;
  name: string;
  description?: string;
  privacy: "public" | "private";
  coverUrl?: string | null;
  membersCount?: number;
  createdAt?: string;
  // ...any other fields backend returns
};

const GroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { fetchGroupById } = useData();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [role, setRole] = useState<"SUPER_ADMIN" | "ADMIN" | "MEMBER" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GroupTab>("feed");
  const [joinStatus, setJoinStatus] = useState<"idle" | "joining" | "joined" | "pending">("idle");

  useEffect(() => {
    if (!groupId) {
      navigate("/GroupsPage");
      return;
    }
    setLoading(true);
    setError(null);
    fetchGroupById(groupId)
      .then((data) => {
        // Response shape isn't documented by the backend — handle both a
        // wrapped { group, role } response and a flat group DTO with the
        // role inlined on it.
        const groupData = data?.group ?? data;
        const roleData = data?.role ?? data?.currentUserRole ?? null;
        if (groupData) setGroup(groupData);
        setRole(roleData);
        // Restore "Request Pending" across mounts/reloads — without this the
        // button silently falls back to "Join Group" even though a request
        // is still awaiting admin review.
        const joinRequestStatus = data?.joinRequestStatus ?? groupData?.joinRequestStatus ?? null;
        setJoinStatus(roleData ? "joined" : joinRequestStatus === "PENDING" ? "pending" : "idle");
      })
      .catch((err) => {
        console.error("Failed to load group:", err);
        setError("Unable to load group. It may have been removed or you do not have access.");
      })
      .finally(() => setLoading(false));
  }, [groupId, navigate]);

  const handleNavigateTab = (tab: GroupTab) => {
    setActiveTab(tab);
    document.getElementById("group-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleJoin = async () => {
    if (!groupId || joinStatus === "joining") return;
    setJoinStatus("joining");
    try {
      const res = await usersApi.joinGroup(groupId);
      const status = res.data?.data?.status;
      if (status === "PENDING_APPROVAL") {
        setJoinStatus("pending");
        toast("Join request sent — an admin needs to approve it.", "info");
      } else {
        // Public group: membership is immediate — unlock the feed/members
        // tabs right away instead of waiting on a manual refetch.
        setJoinStatus("joined");
        setRole("MEMBER");
        setGroup((prev) => (prev ? { ...prev, membersCount: (prev.membersCount ?? 0) + 1 } : prev));
        toast("You've joined the group!", "success");
      }
    } catch (err) {
      console.error("Failed to join group:", err);
      setJoinStatus("idle");
      toast("Couldn't join this group. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-200 dark:from-navy-900 dark:to-surface pt-20 md:pt-4 p-4">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse bg-surface rounded-2xl p-6 border border-sky-100 dark:border-border">
              <div className="h-44 bg-surface-muted rounded-lg mb-4" />
              <div className="h-6 w-1/2 bg-surface-muted rounded mb-2" />
              <div className="h-4 w-1/4 bg-surface-muted rounded" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-200 dark:from-navy-900 dark:to-surface pt-24 md:pt-6 p-6">
          <div className="max-w-3xl mx-auto bg-surface rounded-lg p-6 shadow-soft border border-border">
            <h3 className="text-lg font-semibold text-ink">Error</h3>
            <p className="text-ink-muted mt-2">{error}</p>
            <button
              onClick={() => navigate("/GroupsPage")}
              className="mt-4 inline-block bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition"
            >
              Back to groups
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!group) return null;

  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-200 dark:from-navy-900 dark:to-surface pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-16 md:pt-0">
          {/* Hero */}
          <Hero group={group} role={role} joinStatus={joinStatus} onJoin={handleJoin} />

          {/* Admin Panel (only for Admins) */}
          {isAdmin && <AdminPanel onNavigateTab={handleNavigateTab} />}

          {/* Tabs (Feed / Members / Analytics / Settings) */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Tabs
              group={group}
              role={role}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onGroupUpdated={(updated) => setGroup((prev) => (prev ? { ...prev, ...updated } : prev))}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default GroupPage;
