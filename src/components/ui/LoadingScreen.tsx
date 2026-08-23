// src/components/ui/LoadingScreen.tsx
import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-sky-100 to-navy-100 dark:from-navy-900 dark:to-surface">
      {/* Animated Icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="p-6 bg-surface rounded-full shadow-soft-lg"
      >
        <Sparkles className="w-14 h-14 text-sky-500" />
      </motion.div>

      {/* Animated Text */}
      <motion.p
        className="mt-6 text-xl font-semibold text-ink"
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
