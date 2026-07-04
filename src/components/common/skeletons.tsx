import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-neutral-200 dark:bg-neutral-800",
        className
      )}
    />
  );
}

export function MetricSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-5 border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl space-y-3"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeadRowSkeleton() {
  return (
    <div className="border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4.5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3 p-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4.5 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
