import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Chanuka from "../assets/Chanuka.jpg";
import Prashan from "../assets/Prashan.jpg";
import Dinal from "../assets/Dinal.jpg";
import Maniya from "../assets/Maniya.jpg";
import Kavindu from "../assets/Kavindu.jpg";
import Tharinda from "../assets/Tharinda.jpg";
import Prabs from "../assets/Prabs.jpg";

// Dummy data
const followers = [
  { id: 1, name: "Dinal Jayakody", img: Dinal },
  { id: 2, name: "Prashan Thilakawardana", img: Prashan },
  { id: 4, name: "Kavindu Rathnayaka", img: Kavindu },
  { id: 4, name: "Prabuddha Rathnayaka", img: Prabs },
  { id: 4, name: "Manisha Perera", img: Maniya },
  { id: 4, name: "Chanuka Nuwankalpa", img: Chanuka },
  { id: 4, name: "Chanuka Nuwankalpa", img: Prabs },
  { id: 4, name: "Chanuka Nuwankalpa", img: Kavindu },
  { id: 4, name: "Chanuka Nuwankalpa", img: Maniya },
  { id: 4, name: "Chanuka Nuwankalpa", img: Chanuka },

];

const following = [
  { id: 3, name: "Tharinda Withanage", img: Tharinda },
  { id: 4, name: "Chanuka Nuwankalpa", img: Chanuka },
  { id: 4, name: "Chanuka Nuwankalpa", img: Prabs },
  { id: 4, name: "Chanuka Nuwankalpa", img: Kavindu },
  { id: 4, name: "Chanuka Nuwankalpa", img: Maniya },
];


const communities = [
  { id: 5, name: "Photography Enthusiasts", img: "https://api.dicebear.com/6.x/shapes/svg?seed=photo" },
  { id: 6, name: "Music", img: "https://api.dicebear.com/6.x/shapes/svg?seed=music" },
  { id: 7, name: "Gaming Legends", img: "https://api.dicebear.com/6.x/shapes/svg?seed=gaming" },
];

const panels = ["Followers", "Following", "Communities"];

const FriendsPage: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string>("Followers");
  const [search, setSearch] = useState<string>("");

  const getPanelData = () => {
    let data: any[] = [];
    if (activePanel === "Followers") data = followers;
    if (activePanel === "Following") data = following;
    if (activePanel === "Communities") data = communities;

    return data.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-100 to-sky-200">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white/60 shadow-md p-4 flex flex-col gap-4">
          <nav className="flex flex-col gap-3">
            {panels.map((panel) => (
              <button
                key={panel}
                onClick={() => {
                  setActivePanel(panel);
                  setSearch("");
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition ${
                  activePanel === panel
                    ? "bg-sky-200 text-sky-900 font-semibold"
                    : "hover:bg-sky-100 text-gray-700"
                }`}
              >
                {panel === "Followers" ? "👥" : panel === "Following" ? "🤝" : "🏘️"}
                {panel}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 flex justify-center overflow-y-auto">
          <div className="w-full max-w-2xl">
            {/* Search bar */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-sky-800">{activePanel}</h2>
              <input
                type="text"
                placeholder={`Search ${activePanel.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-sky-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* List view */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activePanel}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-3"
              >
                {getPanelData().map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white/80 p-3 rounded-lg shadow hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-10 h-10 rounded-full border"
                      />
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </div>

                    {activePanel === "Followers" && (
                      <button className="px-3 py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                        Follow Back
                      </button>
                    )}

                    {activePanel === "Following" && (
                      <button className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">
                        Unfollow
                      </button>
                    )}

                    {activePanel === "Communities" && (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600">
                          Join
                        </button>
                        <button className="px-3 py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                          View
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FriendsPage;
