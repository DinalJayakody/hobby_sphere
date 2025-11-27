import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Instagram-style "Terms of Service" modal
 * Matches Hobby Sphere UI theme (glass effect, dark mode, rounded corners)
 */

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
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
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto backdrop-blur-lg p-6 relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  Terms of Service
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Last updated: September 2025
                </p>
              </div>

              {/* Body */}
              <div className="space-y-5 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                <p>
                  Welcome to <span className="font-semibold">Hobby Sphere</span>.
                  These Terms of Service (“Terms”) govern your use of our platform,
                  community features, and all related services.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By accessing or using Hobby Sphere, you agree to comply with
                  these Terms and all applicable laws. If you do not agree, you
                  may not use the platform.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  2. Account Responsibilities
                </h3>
                <p>
                  You are responsible for maintaining the confidentiality of your
                  account information and for all activities under your account.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  3. Acceptable Use
                </h3>
                <p>
                  You agree not to post, share, or distribute harmful, misleading,
                  or illegal content. We reserve the right to remove content or
                  suspend accounts that violate community guidelines.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  4. Intellectual Property
                </h3>
                <p>
                  All content, trademarks, and materials available on Hobby Sphere
                  are owned by us or our licensors. You may not copy, reproduce, or
                  distribute any part of the platform without permission.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  5. Limitation of Liability
                </h3>
                <p>
                  Hobby Sphere is provided “as is” without warranties of any kind.
                  We are not liable for any direct or indirect damages arising from
                  your use of the service.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  6. Termination
                </h3>
                <p>
                  We may suspend or terminate your account if you violate these
                  Terms or engage in behavior harmful to the community.
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  7. Modifications
                </h3>
                <p>
                  We may update these Terms occasionally. Continued use of Hobby
                  Sphere after updates means you accept the revised Terms.
                </p>

                <p className="text-center mt-8 text-gray-500 text-xs">
                  By using Hobby Sphere, you agree to these Terms of Service.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
