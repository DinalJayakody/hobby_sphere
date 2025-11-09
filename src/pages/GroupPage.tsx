// src/pages/GroupPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { motion } from "framer-motion";
import { useData } from "../context/DataContext"; // import your DataContext function
import AdminPanel from "../components/group/AdminPanel";
import Tabs from "../components/group/Tabs";
import Hero from "../components/group/hero";

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
  const { fetchGroupById } = useData(); // ✅ get function from context
  const [group, setGroup] = useState<Group | null>(null);
  const [role, setRole] = useState<"admin" | "member" | "guest" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      navigate("/GroupsPage");
      return;
    }
    setLoading(true);
    setError(null);
    fetchGroupById(groupId)
      .then((data) => {
        // expected response: { group: {...}, role: 'admin' | 'member' | 'guest' }
        if (data?.group) setGroup(data.group);
        if (data?.role) setRole(data.role);
      })
      .catch((err) => {
        console.error("Failed to load group:", err);
        setError("Unable to load group. It may have been removed or you do not have access.");
      })
      .finally(() => setLoading(false));
  }, [groupId, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-200 p-4">
          <div className="max-w-5xl mx-auto">
            {/* Loading skeletons */}
            <div className="animate-pulse bg-white rounded-2xl p-6 border border-sky-100">
              <div className="h-44 bg-sky-100 rounded-lg mb-4" />
              <div className="h-6 w-1/2 bg-sky-100 rounded mb-2" />
              <div className="h-4 w-1/4 bg-sky-100 rounded" />
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
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-200 p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-800">Error</h3>
            <p className="text-gray-600 mt-2">{error}</p>
            <button
              onClick={() => navigate("/GroupsPage")}
              className="mt-4 inline-block bg-sky-600 text-white py-2 px-4 rounded-lg"
            >
              Back to groups
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!group) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-200 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero */}
          <Hero group={group} role={role} />

          {/* Admin Panel (only for Admins) */}
          {role === "admin" && <AdminPanel group={group} />}

          {/* Tabs (Feed / Members / Analytics / Settings) */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Tabs group={group} role={role} />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default GroupPage;
