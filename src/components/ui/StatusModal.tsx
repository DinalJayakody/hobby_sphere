import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X } from "lucide-react";

type Status = "success" | "error";

interface StatusModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  status?: Status;
  autoCloseMs?: number | null; // e.g. 3500 to auto close, null to disable
}

/**
 * Generic status modal (success / error). Use this directly or via ModalProvider.
 * - open/onClose: controlled props
 * - title/message: content
 * - status: 'success' | 'error' (controls icon + colors)
 * - autoCloseMs: if set closes automatically after ms
 */
export const StatusModal: React.FC<StatusModalProps> = ({
  open,
  onClose,
  title,
  message,
  status = "success",
  autoCloseMs = 3500,
}) => {
  React.useEffect(() => {
    if (!open || !autoCloseMs) return;
    const t = setTimeout(() => {
      onClose();
    }, autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  const bg =
    status === "success" ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-coral-50 dark:bg-coral-500/10";
  const ring =
    status === "success" ? "ring-emerald-400 dark:ring-emerald-500/40" : "ring-coral-400 dark:ring-coral-500/40";
  const Icon = status === "success" ? CheckCircle : XCircle;
  const iconColor = status === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-coral-600 dark:text-coral-400";

  return (
    <AnimatePresence>
      {open && (
        // backdrop
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 pointer-events-auto"
          aria-hidden={!open}
        >
          {/* click outside - close */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />

          {/* modal card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || status}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative max-w-md w-full ${bg} ${ring} ring-1 rounded-xl shadow-2xl p-4 sm:p-5`}
          >
            {/* close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full text-ink-muted hover:text-ink"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 rounded-full p-2 ${status === "success" ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-coral-100 dark:bg-coral-500/20"}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-ink">
                  {title || (status === "success" ? "Success" : "Error")}
                </h3>
                {message && (
                  <p className="mt-1 text-xs sm:text-sm text-ink-muted">{message}</p>
                )}
                {/* optional actions area (for future) */}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
