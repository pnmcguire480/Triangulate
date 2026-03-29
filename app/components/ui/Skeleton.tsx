import { cn } from "~/lib/utils";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse bg-ink/6 rounded-sm", className)}
    />
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="py-5 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-6 w-4/5 mb-1" />
      <Skeleton className="h-6 w-3/5 mb-3" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-2 w-12" />
        <Skeleton className="h-1 flex-1" />
        <Skeleton className="h-2 w-10" />
      </div>
    </div>
  );
}
