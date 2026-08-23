import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, subtitle, action, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}
  >
    <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-sky-500 animate-float" />
    </div>
    <h3 className="text-ink font-semibold text-base mb-1">{title}</h3>
    {subtitle && <p className="text-ink-muted text-sm max-w-xs">{subtitle}</p>}
    {action && <div className="mt-4">{action}</div>}
  </motion.div>
);

export default EmptyState;
