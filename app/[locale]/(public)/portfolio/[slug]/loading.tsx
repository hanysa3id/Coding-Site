import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Hero */}
      <Skeleton className="w-full h-72 rounded-2xl" />

      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-4/6" />
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-video rounded-xl" />
        ))}
      </div>
    </div>
  );
}
