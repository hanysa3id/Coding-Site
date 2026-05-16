import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Cover */}
      <Skeleton className="w-full h-64 rounded-2xl" />

      {/* Meta */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Title */}
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-3/4" />

      {/* Body */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`h-5 w-${i % 3 === 0 ? "5/6" : i % 3 === 1 ? "full" : "4/6"}`} />
        ))}
      </div>

      <Skeleton className="h-48 rounded-xl" />

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    </article>
  );
}
