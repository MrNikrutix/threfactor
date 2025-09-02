import React from 'react';

export function WorkoutsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="h-12 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}