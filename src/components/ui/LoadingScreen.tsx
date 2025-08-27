// src/components/ui/LoadingScreen.tsx
import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-blue-100 to-blue-200">
      {/* Animated Icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="p-6 bg-white rounded-full shadow-xl"
      >
        <Sparkles className="w-14 h-14 text-blue-500" />
      </motion.div>

      {/* Animated Text */}
      <motion.p
        className="mt-6 text-xl font-semibold text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
      >
        Preparing your experience...
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
