import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Home } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 dark:from-navy-900 dark:to-surface">
      <Navbar />
      <div className="flex flex-col items-center justify-center px-6 pt-32 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-20 h-20 rounded-3xl bg-surface shadow-soft-lg border border-border flex items-center justify-center mb-6"
        >
          <Compass className="w-10 h-10 text-sky-500 animate-float" />
        </motion.div>
        <h1 className="text-3xl font-bold text-ink mb-2">Page not found</h1>
        <p className="text-ink-muted max-w-sm mb-6">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Button onClick={() => navigate("/")} variant="primary">
          <Home className="w-4 h-4" /> Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
