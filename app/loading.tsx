import React from "react";

export default function Loading() {
  return (
    <div className="p-8 md:p-12 space-y-10 bg-slate-50/50 min-h-screen">
      <div className="animate-pulse space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-24 bg-slate-200 rounded-full" />
          <div className="h-12 w-64 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-96 bg-slate-200 rounded-full" />
        </div>

        {/* Card Skeletons */}
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 w-full max-w-5xl bg-white rounded-[2.5rem] border border-slate-100 shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
