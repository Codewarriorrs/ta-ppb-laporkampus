import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-200/80 rounded-xl ${className}`} />
  );
}

export default Skeleton;

export function ReportCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 animate-pulse shadow-sm">
      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 bg-gray-200 rounded-full w-16" />
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1.5" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
      </div>
    </div>
  );
}

export function FacilityCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5 flex gap-3.5 animate-pulse shadow-sm">
      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1.5" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
        </div>
        <div className="h-5 bg-gray-200 rounded-full w-24" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="w-full h-60 bg-gray-200 rounded-xl" />
      <div className="h-5 bg-gray-200 rounded-full w-24" />
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="w-full h-44 bg-gray-200 rounded-xl mt-4" />
    </div>
  );
}
