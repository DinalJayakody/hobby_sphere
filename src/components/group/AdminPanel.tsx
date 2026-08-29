// src/components/group/AdminPanel.tsx
import React from "react";
import { UserPlus, PenTool } from "lucide-react";
import { motion } from "framer-motion";

export type GroupTab = "feed" | "members" | "analytics" | "settings";

const cards: { key: GroupTab; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "feed", title: "Create Post", subtitle: "Share with the group", icon: PenTool },
  { key: "members", title: "Manage Members", subtitle: "Review join requests", icon: UserPlus },
];

// "View Insights" and "Edit Group" were removed — no backend endpoint exists
// for group analytics or editing a group's settings after creation, so
// those cards were dead anchors that went nowhere. These two are real.
const AdminPanel: React.FC<{ onNavigateTab: (tab: GroupTab) => void }> = ({ onNavigateTab }) => {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400">Admin Controls</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="flex md:grid md:grid-cols-2 lg:w-1/2 gap-4 md:gap-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                key={c.key}
                onClick={() => onNavigateTab(c.key)}
                className="min-w-[200px] md:min-w-0 bg-surface border border-sky-100 dark:border-border rounded-2xl p-4 flex items-center gap-3 shadow-soft hover:shadow-soft-lg transition-shadow"
              >
                <div className="bg-sky-50 dark:bg-sky-500/10 p-3 rounded-xl">
                  <Icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-ink">{c.title}</div>
                  <div className="text-xs text-ink-faint mt-1">{c.subtitle}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;
