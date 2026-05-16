import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <div className="container py-12 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-1/2 mx-auto" />
        <Skeleton className="h-5 w-3/4 mx-auto" />
      </div>
      <div className="space-y-12">
        {Array.from({ length: 2 }).map((_, ci) => (
          <section key={ci} className="space-y-5">
            <Skeleton className="h-7 w-48" />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
