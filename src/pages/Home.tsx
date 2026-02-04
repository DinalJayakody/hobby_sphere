import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Navbar from "../components/layout/Navbar";
import Stories from "../components/home/Stories";
import CreatePostCard from "../components/home/CreatePostCard";
import PostCard from "../components/home/PostCard";
import Chanuka from "../assets/Chanuka.jpg";
import Prashan from "../assets/Prashan.jpg";
import Dinal from "../assets/Dinal.jpg";
import Avatar from "../components/ui/Avatar";
import {
  Users,
  Bookmark,
  FileText,
  UsersRound,
  Calendar,
  Home as HomeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const { posts } = useData();
  const navigate = useNavigate();

  let imageSrc = "";
  if (user) {
    imageSrc = `data:image/png;base64,${user.profilePicture}`;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-sky-100 to-sky-200">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-14 w-14 border-4 border-sky-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-sky-700 font-semibold animate-pulse">
          Loading your feed...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-200">
      <Navbar />

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto px-2 pt-16 pb-10 grid grid-cols-1 md:grid-cols-[72px_1fr_360px] gap-6">

        {/* LEFT ICON PANEL (Instagram style) */}
        <div className="hidden md:block">
          <div className="sticky top-24">
            <div className="group flex flex-col gap-2 bg-white/90 backdrop-blur rounded-2xl shadow p-2 w-[72px] hover:w-52 transition-all duration-300 overflow-hidden">

              {[
                { icon: HomeIcon, label: "Home", action: () => navigate("/") },
                { icon: Users, label: "Friends", action: () => navigate("/FriendsPage") },
                { icon: UsersRound, label: "Groups", action: () => navigate("/GroupsPage") },
                { icon: FileText, label: "Pages", action: () => navigate("/Pages") },
                { icon: Bookmark, label: "Saved" },
                { icon: Calendar, label: "Events" },
              ].map(({ icon: Icon, label, action }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action}
                  className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-sky-50 text-gray-700 font-medium transition"
                >
                  <Icon className="w-6 h-6 text-sky-600 shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE FEED (SHIFTED LEFT) */}
        <div className="max-w-[640px] mx-auto w-full">
          <Stories />
          <CreatePostCard />
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden md:block">
          <div className="sticky top-24 space-y-4">

            {/* USER CARD */}
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center space-x-3">
                <img
                  src={imageSrc}
                  alt={user.fullName}
                  onClick={() => navigate("/profile")}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-sky-400 transition"
                />
                <div>
                  <h3
                    onClick={() => navigate("/profile")}
                    className="font-semibold text-gray-900 hover:text-sky-600 cursor-pointer"
                  >
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    @{user.username}
                  </p>
                </div>
              </div>
            </div>

            {/* SUGGESTIONS */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="font-semibold mb-3 text-sky-700">
                Suggestions For You
              </h3>

              <div className="space-y-3">
                {[
                  { name: "Chanuka Nuwankalpa", role: "Music", src: Chanuka },
                  { name: "Tharinda Withanage", role: "Music", src: Prashan },
                  { name: "Dinal Jayakody", role: "Music", src: Dinal },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar src={s.src} alt={s.name} size="sm" />
                      <div className="text-sm">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.role}</p>
                      </div>
                    </div>
                    <button className="text-sky-600 text-sm font-medium hover:underline">
                      Follow
                    </button>
                  </motion.div>
                ))}
              </div>

              <button className="w-full text-sky-600 text-sm font-medium mt-3 pt-3 border-t border-gray-100">
                See All Suggestions
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
