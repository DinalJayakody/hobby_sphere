// src/components/group/Analytics.tsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../types/axiosInstance";

const Analytics: React.FC<{ groupId: string }> = ({ groupId }) => {
  const [metrics, setMetrics] = useState<any>(null);
  useEffect(() => {
    const fetch = async () => {
      try {
        // GET /api/groups/:groupId/analytics
        const res = await axiosInstance.get(`/api/groups/${groupId}/analytics`);
        setMetrics(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [groupId]);

  if (!metrics) return <div className="animate-pulse h-36 bg-sky-100 rounded-xl" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl border border-sky-100">
        <div className="text-sm text-gray-500">Members Growth</div>
        <div className="text-xl font-bold text-sky-700 mt-2">{metrics.membersGrowth ?? "—"}</div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-sky-100">
        <div className="text-sm text-gray-500">Engagement</div>
        <div className="text-xl font-bold text-sky-700 mt-2">{metrics.engagementPercent ?? "—"}%</div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-sky-100">
        <div className="text-sm text-gray-500">Posts / Week</div>
        <div className="text-xl font-bold text-sky-700 mt-2">{metrics.postsPerWeek ?? 0}</div>
      </div>
    </div>
  );
};

export default Analytics;
