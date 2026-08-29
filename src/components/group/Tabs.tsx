// src/components/group/Tabs.tsx
import React, { Suspense } from "react";
import { motion } from "framer-motion";
import Feed from "./Feed";
import Members from "./Members";
import Analytics from "./Analytics";
import Settings from "./Settings";
import { GroupTab } from "./AdminPanel";

interface TabsProps {
  group: any;
  role: any;
  activeTab: GroupTab;
  onTabChange: (tab: GroupTab) => void;
  onGroupUpdated?: (updated: any) => void;
}

const Tabs: React.FC<TabsProps> = ({ group, role, activeTab, onTabChange, onGroupUpdated }) => {
  // Roles come back from the backend as uppercase ("SUPER_ADMIN" / "ADMIN" /
  // "MEMBER") — comparing against lowercase "admin" here meant these tabs
  // never showed for real admins even though AdminPanel (checked correctly
  // elsewhere) did.
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const tabBtn = (key: GroupTab, label: string) => (
    <button
      className={`px-3 py-2 rounded-lg transition-colors ${
        activeTab === key ? "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300" : "text-ink-muted hover:text-ink"
      }`}
      onClick={() => onTabChange(key)}
    >
      {label}
    </button>
  );

  return (
    <section className="mt-6" id="group-tabs">
      <div className="bg-surface/80 border border-sky-100 dark:border-border rounded-2xl p-3 flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {tabBtn("feed", "Feed")}
          {tabBtn("members", "Members")}
          {isAdmin && tabBtn("analytics", "Analytics")}
          {isAdmin && tabBtn("settings", "Settings")}
        </div>

        <div className="text-sm text-ink-muted shrink-0 ml-2">{group.groupMemberCount ?? group.membersCount ?? 0} members</div>
      </div>

      <div className="mt-4">
        <Suspense fallback={<div className="p-6 bg-surface rounded-xl animate-pulse h-40" />}>
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            {activeTab === "feed" && <Feed groupId={group.id} isMember={role != null} />}
            {activeTab === "members" && <Members groupId={group.id} role={role} />}
            {activeTab === "analytics" && isAdmin && <Analytics groupId={group.id} />}
            {activeTab === "settings" && isAdmin && <Settings group={group} onUpdated={onGroupUpdated} />}
          </motion.div>
        </Suspense>
      </div>
    </section>
  );
};

export default Tabs;
