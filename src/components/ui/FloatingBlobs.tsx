import React from 'react';

/**
 * Soft drifting gradient blobs used as ambient decoration behind auth/marketing
 * screens. Pure CSS transform animation (see .animate-blob in index.css) —
 * no JS per-frame work, safe for low-power mobile devices.
 */
const FloatingBlobs: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
    <div className="animate-blob absolute -top-16 -left-16 w-64 h-64 rounded-full bg-sky-300/40 blur-3xl" />
    <div className="animate-blob animation-delay-2000 absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-navy-300/30 blur-3xl" />
    <div className="animate-blob animation-delay-4000 absolute -bottom-20 left-1/4 w-56 h-56 rounded-full bg-sky-400/30 blur-3xl" />
  </div>
);

export default FloatingBlobs;
