// src/components/group/AdminPanel.tsx
import React from "react";
import { Edit3, UserPlus, BarChart2, PenTool } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const cards = [
  { key: "create", title: "Create Post", icon: PenTool },
  { key: "members", title: "Manage Members", icon: UserPlus },
  { key: "insights", title: "View Insights", icon: BarChart2 },
  { key: "edit", title: "Edit Group", icon: Edit3 },
];

const AdminPanel: React.FC<{ group?: any }> = ({ group }) => {
  const navigate = useNavigate();
  const handle = (key: string) => {
    if (key === "create") navigate(`#createPost`);
    if (key === "members") navigate(`#members`);
    if (key === "insights") navigate(`#analytics`);
    if (key === "edit") navigate(`#settings`);
  };

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-semibold text-sky-700">Admin Controls</h3>
      </div>

      {/* mobile horizontal scroll, desktop grid */}
      <div className="overflow-x-auto">
        <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <motion.button
                whileHover={{ scale: 1.03 }}
                key={c.key}
                onClick={() => handle(c.key)}
                className="min-w-[200px] md:min-w-0 bg-white border border-sky-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md"
              >
                <div className="bg-sky-50 p-3 rounded-xl">
                  <Icon className="w-6 h-6 text-sky-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">{c.title}</div>
                  <div className="text-xs text-gray-500 mt-1">Quick access</div>
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
