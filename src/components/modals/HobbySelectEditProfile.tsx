import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  X,
  Plus,
  CheckCircle,
  Music,
  Camera,
  BookOpen,
  Gamepad2,
  Dumbbell,
  Plane,
  Code,
  Coffee,
  Mountain,
  Guitar,
  ChefHat,
} from "lucide-react";

interface HobbySelectEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  setProfileData: (data: any) => void;
}

const HobbySelectEditProfileModal: React.FC<HobbySelectEditProfileModalProps> = ({
  isOpen,
  onClose,
  profileData,
  setProfileData,
}) => {
  const [hobby, setHobby] = useState(profileData.mainHobby || "");
  const [customHobbyInput, setCustomHobbyInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHobby(profileData.mainHobby || "");
    }
  }, [isOpen, profileData]);

  const hobbies = [
    { name: "Art & Design", icon: Palette, color: "from-purple-400 to-pink-400" },
    { name: "Music", icon: Music, color: "from-blue-400 to-purple-400" },
    { name: "Photography", icon: Camera, color: "from-green-400 to-blue-400" },
    { name: "Reading", icon: BookOpen, color: "from-orange-400 to-red-400" },
    { name: "Gaming", icon: Gamepad2, color: "from-red-400 to-purple-400" },
    { name: "Fitness", icon: Dumbbell, color: "from-green-400 to-teal-400" },
    { name: "Travel", icon: Plane, color: "from-blue-400 to-cyan-400" },
    { name: "Coding", icon: Code, color: "from-gray-400 to-blue-400" },
    { name: "Coffee", icon: Coffee, color: "from-yellow-600 to-orange-500" },
    { name: "Hiking", icon: Mountain, color: "from-green-500 to-emerald-500" },
    { name: "Guitar", icon: Guitar, color: "from-amber-400 to-orange-400" },
    { name: "Cooking", icon: ChefHat, color: "from-red-400 to-pink-400" },
  ];

  const handleSelect = (selected: string) => {
    setHobby(selected);
    setProfileData((prev: any) => ({ ...prev, mainHobby: selected }));
    setShowCustomInput(false);
  };

  const handleAddCustom = () => {
    if (customHobbyInput.trim()) {
      setProfileData((prev: any) => ({ ...prev, mainHobby: customHobbyInput.trim() }));
      setHobby(customHobbyInput.trim());
      setCustomHobbyInput("");
      setShowCustomInput(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Palette className="w-8 h-8 text-blue-700" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Select Your Hobby</h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Choose your favorite hobby or add your own custom one
              </p>
            </div>

            {/* Hobby Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {hobbies.map((item, i) => {
                const IconComponent = item.icon;
                const isSelected = hobby === item.name;
                return (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(item.name)}
                    className={`relative p-4 rounded-xl transition-all duration-300 ${
                      isSelected
                        ? "bg-white/60 border-2 border-blue-500 shadow-lg"
                        : "bg-white/30 border border-slate-300/50 hover:bg-white/40"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-3 shadow-md`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-slate-800 font-medium text-sm">{item.name}</p>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="w-3 h-3 bg-white rounded-full"
                        />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}

              {/* Add Custom Hobby Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCustomInput(true)}
                className={`p-4 rounded-xl border border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[100px] ${
                  hobby === "Custom"
                    ? "bg-white/60 border-blue-500 shadow-lg"
                    : "bg-white/30 border-slate-400 hover:bg-white/40"
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="text-slate-800 font-medium text-sm">Add Custom</p>
              </motion.button>
            </div>

            {/* Custom Hobby Input */}
            <AnimatePresence>
              {showCustomInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/40 rounded-xl p-5 border border-slate-300/50 mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-800 font-medium text-base">Add Custom Hobby</h3>
                    <button
                      onClick={() => setShowCustomInput(false)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter your hobby (e.g. Surfing, Painting...)"
                      value={customHobbyInput}
                      onChange={(e) => setCustomHobbyInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                      className="w-full p-3 bg-white/60 border border-slate-300/50 rounded-lg text-slate-800 placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                    />
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddCustom}
                        disabled={!customHobbyInput.trim()}
                        className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200"
                      >
                        Add Hobby
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCustomInput(false)}
                        className="flex-1 p-3 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg font-medium transition-all duration-200"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HobbySelectEditProfileModal;
