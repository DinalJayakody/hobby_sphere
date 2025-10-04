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
import Tharinda from "../assets/Tharinda.jpg";
import Avatar from "../components/ui/Avatar";
import {
  Users,
  Bookmark,
  FileText,
  UsersRound,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { posts } = useData();

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
          className="h-14 w-14 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-blue-700 font-semibold animate-pulse">
          Loading your feed...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className=" sticky min-h-screen bg-gradient-to-br from-sky-50 to-sky-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sticky Panel - Options */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex flex-col gap-6">
                {[
                  { icon: Users, label: "Friends" },
                  { icon: Bookmark, label: "Saved" },
                  { icon: FileText, label: "Pages" },
                  { icon: UsersRound, label: "Groups" },
                  { icon: Calendar, label: "Events" },
                ].map(({ icon: Icon, label }) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.05, x: 4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (label === "Friends") navigate("/FriendsPage");
                      else if (label === "Pages") navigate("/Pages");
                      else if (label === "Groups") navigate("/GroupsPage");
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sky-50 text-gray-700 font-medium transition"
                  >
                    <Icon className="w-5 h-5 text-sky-600" />
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Feed */}
        <div className="md:col-span-2">
          <Stories />
          <CreatePostCard />
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Right Sticky Panel - Suggestions */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <img
              src={imageSrc}
              alt={user.fullName}
              onClick={() => navigate(`/profile`)}
              className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
            />
            <div>
              <h3
                onClick={() => navigate(`/profile`)}
                className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition"
              >
                {user.fullName}
              </h3>
              <p
                onClick={() => navigate(`/profile`)}
                className="text-sm text-gray-500 cursor-pointer hover:text-blue-400 transition"
              >
                @{user.username}
              </p>
            </div>
          </div>

              {/* <div className="flex justify-between py-3 text-sm">
                <div className="text-center">
                  <p className="font-semibold">{user.posts}</p>
                  <p className="text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.followersCount}</p>
                  <p className="text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.followingCount}</p>
                  <p className="text-gray-500">Following</p>
                </div>
              </div> */}
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="font-semibold mb-3 text-sky-700">
                Suggestions For You
              </h3>
              <div className="space-y-3">
                {[
                  {
                    name: "Chanuka Nuwankalpa",
                    role: "Music",
                    src: Chanuka,
                  },
                  {
                    name: "Tharinda Withanage",
                    role: "Music",
                    src: Prashan,
                  },
                  {
                    name: "Dinal Jayakody",
                    role: "Music",
                    src: Dinal,
                  },
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
