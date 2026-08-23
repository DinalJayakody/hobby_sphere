import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
}

const ICONS: Record<ToastKind, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const ACCENTS: Record<ToastKind, string> = {
  success: 'border-l-4 border-l-emerald-500 text-emerald-600 dark:text-emerald-400',
  error: 'border-l-4 border-l-coral-500 text-coral-600 dark:text-coral-400',
  info: 'border-l-4 border-l-sky-500 text-sky-600 dark:text-sky-400',
};

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastViewport: React.FC<ToastViewportProps> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-20 md:bottom-6 right-4 z-[1100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => {
        const Icon = ICONS[t.kind];
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className={`pointer-events-auto flex items-start gap-2.5 ${ACCENTS[t.kind]} bg-surface-raised text-ink rounded-xl shadow-soft-lg px-4 py-3`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm flex-1 text-ink leading-snug">{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-ink-faint hover:text-ink transition shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);
