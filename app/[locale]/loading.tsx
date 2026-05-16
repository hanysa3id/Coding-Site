import { Skeleton } from "@/components/ui/skeleton";

export default function LocaleLoading() {
  return (
    <div className="container py-12 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto py-12">
        <Skeleton className="h-6 w-48 mx-auto rounded-full" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-2/3 mx-auto" />
        <div className="flex gap-3 justify-center pt-4">
          <Skeleton className="h-11 w-36" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 md:grid-cols-3 pt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-3">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
