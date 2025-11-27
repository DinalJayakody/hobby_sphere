// src/components/group/Tabs.tsx
import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Feed from "./Feed";
import Members from "./Members";
import Analytics from "./Analytics";
import Settings from "./Settings";

const Tabs: React.FC<{ group: any; role: any }> = ({ group, role }) => {
  const [tab, setTab] = useState<"feed" | "members" | "analytics" | "settings">("feed");

  const isAdmin = role === "admin";

  return (
    <section className="mt-6">
      <div className="bg-white/80 border border-sky-100 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto">
          <button className={`px-3 py-2 rounded-lg ${tab === "feed" ? "bg-sky-100 text-sky-700" : "text-gray-600"}`} onClick={() => setTab("feed")}>Feed</button>
          <button className={`px-3 py-2 rounded-lg ${tab === "members" ? "bg-sky-100 text-sky-700" : "text-gray-600"}`} onClick={() => setTab("members")}>Members</button>
          {isAdmin && <button className={`px-3 py-2 rounded-lg ${tab === "analytics" ? "bg-sky-100 text-sky-700" : "text-gray-600"}`} onClick={() => setTab("analytics")}>Analytics</button>}
          {isAdmin && <button className={`px-3 py-2 rounded-lg ${tab === "settings" ? "bg-sky-100 text-sky-700" : "text-gray-600"}`} onClick={() => setTab("settings")}>Settings</button>}
        </div>

        <div className="text-sm text-gray-500">{group.membersCount ?? 0} members</div>
      </div>

      <div className="mt-4">
        <Suspense fallback={<div className="p-6 bg-white rounded-xl animate-pulse h-40" />}>
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            {tab === "feed" && <Feed groupId={group.id} />}
            {tab === "members" && <Members groupId={group.id} isAdmin={role === "admin"} />}
            {tab === "analytics" && role === "admin" && <Analytics groupId={group.id} />}
            {tab === "settings" && role === "admin" && <Settings group={group} />}
          </motion.div>
        </Suspense>
      </div>
    </section>
  );
};

export default Tabs;
