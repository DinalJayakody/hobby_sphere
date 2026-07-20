import React from "react";
import { motion } from "framer-motion";
import { Construction } from "lucide-react";

// The backend currently has no API for group feed posts, member lists,
// invites, group settings updates, or group analytics — only group
// discovery/search, join/leave, and the (currently broken) create endpoint
// exist. Shown instead of a tab that would otherwise silently 404.
const ComingSoon: React.FC<{ label: string }> = ({ label }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-sky-100 rounded-2xl p-10 text-center"
  >
    <Construction className="w-10 h-10 mx-auto mb-3 text-sky-300" />
    <h4 className="font-semibold text-gray-700">{label} isn't available yet</h4>
    <p className="text-sm text-gray-500 mt-1">We're still building this part of Groups — check back soon.</p>
  </motion.div>
);

export default ComingSoon;
