import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modern Privacy Policy modal styled like Instagram popups.
 * Uses glass background, rounded corners, smooth animation, and dark mode support.
 */

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 🔹 Background Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 🔹 Modal Container */}
          <motion.div
            className="fixed z-50 inset-0 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto backdrop-blur-lg p-6 relative">
              {/* 🔹 Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 🔹 Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  Privacy Policy
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Last updated: September 2025
                </p>
              </div>

              {/* 🔹 Body */}
              <div className="space-y-5 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                <p>
                  Welcome to <span className="font-semibold">Hobby Sphere</span>.  
                  Your privacy is important to us. This policy explains how we
                  collect, use, and safeguard your personal information.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  1. Information We Collect
                </h3>
                <p>
                  We may collect your name, email, profile photo, and activity data
                  to personalize your experience within the Hobby Sphere platform.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  2. How We Use Your Data
                </h3>
                <p>
                  We use your information to provide, improve, and protect our
                  services — such as personalizing your feed and enabling
                  interactions between users.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  3. Sharing & Disclosure
                </h3>
                <p>
                  We never sell your personal data. We only share it with
                  third-party services essential to app functionality (e.g., secure
                  cloud storage, analytics).
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  4. Your Control
                </h3>
                <p>
                  You can access, modify, or delete your data at any time through
                  your account settings. You can also request account deletion.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  5. Security
                </h3>
                <p>
                  We use encryption and secure storage for all user data. Only
                  authorized personnel can access limited user details.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  6. Updates
                </h3>
                <p>
                  We may update this Privacy Policy from time to time. Any changes
                  will be reflected here with a new “Last updated” date.
                </p>

                <p className="text-center mt-8 text-gray-500 text-xs">
                  By using Hobby Sphere, you agree to this Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
