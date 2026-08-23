import React from 'react';

interface SkeletonProps {
  className?: string;
}

/** A pulsing placeholder block. Compose with utility classes for shape (rounded-full for avatars, etc). */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-surface-muted rounded-md ${className}`} />
);

/** Skeleton for a single feed post card, matching PostCard's layout so the swap-in is seamless. */
export const PostCardSkeleton: React.FC = () => (
  <div className="bg-surface rounded-2xl shadow-soft mb-4 overflow-hidden p-4 border border-border">
    <div className="flex items-center space-x-3 mb-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-3.5 w-full mb-2" />
    <Skeleton className="h-3.5 w-4/5 mb-4" />
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
);

export const ListRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-2/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  </div>
);
