export default function BlogCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface border border-gold/15 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      {/* Cover Skeleton */}
      <div className="aspect-[16/10] bg-gold/10 w-full" />

      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-1 gap-3">
        {/* Category Tag */}
        <div className="h-4 w-24 rounded-full bg-gold/10" />

        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 w-full rounded bg-gold/15" />
          <div className="h-6 w-3/4 rounded bg-gold/15" />
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5 pt-1">
          <div className="h-4 w-full rounded bg-gold/10" />
          <div className="h-4 w-5/6 rounded bg-gold/10" />
        </div>

        {/* Footer Link */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gold/10">
          <div className="h-4 w-20 rounded bg-gold/10" />
          <div className="h-4 w-16 rounded bg-gold/10" />
        </div>
      </div>
    </div>
  );
}
