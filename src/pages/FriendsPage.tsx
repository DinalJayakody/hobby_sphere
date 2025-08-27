import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/layout/Navbar";

// Dummy data
// Human face avatars using Dicebear v6
const friendRequests = [
  { id: 1, name: "Jean Muller", img: "https://api.dicebear.com/6.x/avataaars/svg?seed=jean" },
  { id: 2, name: "Amith Sudeera", img: "https://api.dicebear.com/6.x/avataaars/svg?seed=amith" },
  { id: 3, name: "Kiki Fox", img: "https://api.dicebear.com/6.x/avataaars/svg?seed=kiki" },
  { id: 4, name: "Yanagi Ayuko", img: "https://api.dicebear.com/6.x/avataaars/svg?seed=yanagi" },
];

const suggestions = [
  { id: 1, name: "Lara Croft", img: "https://api.dicebear.com/6.x/avataaars/svg?seed=lara" },
  { id: 2, name: "Tony Stark", img: "https://api.dicebear.com/6.x/avataaars/svg?seed=tony" },
  { id: 3, name: "Natasha Romanoff", img: "https://api.dicebear.com/6.x/avataaars/svg?seed=natasha" },
];

const allFriends = [
  ...friendRequests,
  ...suggestions,
  { id: 5, name: "Clark Kent", img: "https://api.dicebear.com/6.x/avataaars/svg?seed=clark" },
  { id: 6, name: "Bruce Wayne", img: "https://api.dicebear.com/6.x/avataaars/svg?seed=bruce" },
];


const panels = ["Friend Requests", "Suggestions", "All Friends", "Birthdays", "Custom Lists"];

const FriendsPage: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string>("Friend Requests");

  const getPanelData = () => {
    switch (activePanel) {
      case "Friend Requests":
        return friendRequests;
      case "Suggestions":
        return suggestions;
      case "All Friends":
        return allFriends;
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-100 to-blue-200">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-blue-100 to-blue-200 shadow p-4 flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2">👫 Friends</h2>
          <nav className="flex flex-col gap-6">
            {panels
              .filter((panel) => panel !== "Home")
              .map((panel) => (
                <button
                  key={panel}
                  onClick={() => setActivePanel(panel)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-700 ${
                    activePanel === panel ? "bg-blue-100 font-bold" : "hover:bg-gray-100"
                  }`}
                >
                  <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-sm">
                    {panel === "Friend Requests"
                      ? "📨"
                      : panel === "Suggestions"
                      ? "💡"
                      : panel === "All Friends"
                      ? "🧑‍🤝‍🧑"
                      : panel === "Birthdays"
                      ? "🎂"
                      : "📋"}
                  </span>
                  {panel}
                </button>
              ))}
          </nav>
        </aside>

          <div className="w-4 bg-white/50 rounded-r"></div>


        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {activePanel}{" "}
              {activePanel === "Friend Requests" && <span>📨</span>}
              {activePanel === "Suggestions" && <span>💡</span>}
              {activePanel === "All Friends" && <span>🧑‍🤝‍🧑</span>}
            </h2>
            {activePanel === "Friend Requests" && (
              <button className="text-sky-600 hover:underline text-sm">See all</button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {getPanelData().map((friend) => (
                <motion.div
                  key={friend.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white border rounded-lg shadow-sm overflow-hidden relative"
                >
                  {/* Animated Avatar */}
                  <motion.img
                    src={friend.img}
                    alt={friend.name}
                    className="w-full h-40 object-cover"
                    animate={{ y: [0, -10, 0] }} // floating effect
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />

                  <div className="p-3 flex flex-col gap-2">
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      {friend.name} <span>✨</span>
                    </p>

                    {activePanel === "Friend Requests" && (
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700">
                          Confirm
                        </button>
                        <button className="flex-1 bg-gray-200 text-gray-700 py-1 rounded hover:bg-gray-300">
                          Delete
                        </button>
                      </div>
                    )}

                    {activePanel === "Suggestions" && (
                      <button className="bg-green-500 text-white py-1 rounded hover:bg-green-600">
                        Add Friend
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default FriendsPage;
