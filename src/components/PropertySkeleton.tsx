import React from 'react';

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs flex flex-col justify-between animate-pulse">
      <div>
        {/* Image skeleton */}
        <div className="h-44 sm:h-52 w-full bg-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          <div className="absolute bottom-2.5 left-2.5 h-6 w-24 bg-slate-300 rounded-lg" />
          <div className="absolute top-2.5 left-2.5 h-5 w-20 bg-slate-300 rounded-md" />
        </div>

        {/* Body skeleton */}
        <div className="p-3.5 sm:p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-12 bg-slate-200 rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="h-5 w-full bg-slate-200 rounded" />
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-2 sm:p-2.5 rounded-xl">
            <div className="h-4 bg-slate-200 rounded mx-1" />
            <div className="h-4 bg-slate-200 rounded mx-1" />
            <div className="h-4 bg-slate-200 rounded mx-1" />
          </div>
          <div className="h-14 bg-slate-100 border border-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="p-3.5 sm:p-4 pt-0">
        <div className="h-11 bg-slate-200 rounded-xl w-full" />
      </div>
    </div>
  );
};
