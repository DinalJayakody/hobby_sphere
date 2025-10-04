// src/pages/GroupsPage.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UsersRound,
  PlusCircle,
  Search,
  FileText,
  Calendar,
  Users,
  Bookmark,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar"; // Added Navbar

interface Group {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  members: number;
}

const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);

  // 🔹 Fetch groups from backend API
  useEffect(() => {
    // Example API call
    // fetch("/api/groups")
    //   .then((res) => res.json())
    //   .then((data) => setGroups(data));
    setGroups([
      {
        id: "1",
        name: "React Developers",
        description: "A community for React enthusiasts.",
        members: 1240,
      },
      {
        id: "2",
        name: "Music Lovers",
        description: "Share and discuss your favorite music.",
        members: 856,
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-200">
      {/* 🔹 Navbar */}
      <Navbar />

      {/* 🔹 Header */}
      <div className="sticky top-16 md:top-0 bg-white shadow-md p-4 flex items-center justify-between z-20">
        <h1 className="text-xl font-bold text-sky-700">Groups</h1>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/creategroup")}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Create Group
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 🔹 Left Sidebar (Desktop) */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex flex-col gap-2">
                {[
                  { label: "Friends", route: "/FriendsPage", icon: Users },
                  { label: "Saved", route: "/Saved", icon: Bookmark },
                  { label: "Pages", route: "/Pages", icon: FileText },
                  { label: "Groups", route: "/groups", icon: UsersRound },
                  { label: "Events", route: "/Events", icon: Calendar },
                ].map(({ label, route, icon: Icon }) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.03, x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(route)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sky-50 transition text-gray-700 font-medium"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-100">
                      <Icon className="w-5 h-5 text-sky-600" />
                    </div>
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 Groups Feed */}
        <div className="md:col-span-3">
          {/* Search */}
          <div className="bg-white rounded-2xl shadow p-4 mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search groups..."
              className="w-full outline-none text-gray-700"
              // 🔹 Connect with API (onChange → call search endpoint)
            />
          </div>

          {/* Groups List */}
          <div className="grid gap-6">
            {groups.map((group) => (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-2xl shadow p-5 flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                {/* Group Cover Image */}
                <div className="w-full md:w-1/4">
                  <img
                    src={
                      group.coverImage ||
                      "https://via.placeholder.com/300x150.png?text=Group+Cover"
                    }
                    alt={group.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>

                {/* Group Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {group.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{group.description}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {group.members} members
                  </p>
                </div>

                {/* Join Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition"
                  // 🔹 Connect with API → POST /groups/:id/join
                >
                  Join
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔹 Mobile Bottom Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t border-gray-200 flex justify-around py-2 md:hidden z-50">
        {[
          { label: "Home", route: "/", icon: Users },
          { label: "Friends", route: "/FriendsPage", icon: Users },
          { label: "Groups", route: "/groups", icon: UsersRound },
          { label: "Pages", route: "/Pages", icon: FileText },
          { label: "Events", route: "/Events", icon: Calendar },
        ].map(({ label, route, icon: Icon }) => (
          <button
            key={label}
            onClick={() => navigate(route)}
            className="flex flex-col items-center text-gray-600 hover:text-sky-600 transition"
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GroupsPage;
