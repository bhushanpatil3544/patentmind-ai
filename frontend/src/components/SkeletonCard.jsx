import React from 'react';

export default function SkeletonCard({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="wrangler-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 skeleton-shimmer rounded-lg"></div>
            <div className="h-4 w-16 skeleton-shimmer rounded-full"></div>
          </div>
          <div className="h-5 w-3/4 skeleton-shimmer rounded-lg"></div>
          <div className="h-3 w-1/2 skeleton-shimmer rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}
