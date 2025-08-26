import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/layout/Navbar";

// Dummy data for hobby/community pages
const hobbyPages = [
  {
    id: 1,
    name: "Photography Lovers",
    focus: "Sharing tips, tutorials, and beautiful photos from around the world.",
    img: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Baking Masters",
    focus: "A community for baking enthusiasts to share recipes, techniques, and creations.",
    img: "https://images.unsplash.com/photo-1604908177523-06be31c2b1ed?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Travel Enthusiasts",
    focus: "Explore new destinations, share travel experiences and tips.",
    img: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Yoga & Wellness",
    focus: "Connect with fellow yoga lovers, share wellness tips and routines.",
    img: "https://images.unsplash.com/photo-1544058283-4b27d7e27119?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Gaming Arena",
    focus: "Discuss games, strategies, and everything about the gaming world.",
    img: "https://images.unsplash.com/photo-1606813909595-f9e2c71d55c7?auto=format&fit=crop&w=400&q=80",
  },
];

// Left panel buttons
const panels = ["Liked Pages", "Suggested Pages"];

const PagesPage: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string>("Liked Pages");

  const filteredPages = () => {
    // For simplicity, just alternate pages based on panel
    return activePanel === "Liked Pages" ? hobbyPages.slice(0, 3) : hobbyPages.slice(2);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-100 to-blue-200">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <aside className="w-64 bg-white shadow p-4 flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2">📚 Pages</h2>
          <nav className="flex flex-col gap-2">
            {panels.map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-700 ${
                  activePanel === panel ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                }`}
              >
                {panel}
              </button>
            ))}
          </nav>
        </aside>

        {/* White divider */}
        <div className="w-4 bg-white"></div>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <AnimatePresence mode="wait">
            {filteredPages().map((page) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white border rounded-lg shadow-lg overflow-hidden"
              >
                <img
                  src={page.img}
                  alt={page.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {page.name} <span>🎯</span>
                  </h3>
                  <p className="text-gray-700">{page.focus}</p>
                  <div className="mt-2 flex gap-2">
                    <button className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600">
                      {activePanel === "Liked Pages" ? "Visit Page" : "Like Page"}
                    </button>
                    <button className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default PagesPage;
