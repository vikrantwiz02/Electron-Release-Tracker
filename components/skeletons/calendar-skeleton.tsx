import { Skeleton } from "@/components/ui/skeleton"

export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-7 border-b">
          {Array(7)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="py-2 text-center">
                <Skeleton className="h-5 w-8 mx-auto" />
              </div>
            ))}
        </div>

        {Array(5)
          .fill(null)
          .map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {Array(7)
                .fill(null)
                .map((_, dayIndex) => (
                  <div key={dayIndex} className="min-h-[100px] p-2 border">
                    <Skeleton className="h-5 w-5 mb-2" />
                    {Math.random() > 0.7 && <Skeleton className="h-5 w-full max-w-[100px] mt-1" />}
                    {Math.random() > 0.8 && <Skeleton className="h-5 w-full max-w-[80px] mt-1" />}
                  </div>
                ))}
            </div>
          ))}
      </div>

      <div className="flex items-center justify-start gap-4 pt-2">
        {Array(5)
          .fill(null)
          .map((_, i) => (
            <Skeleton key={i} className="h-5 w-16" />
          ))}
      </div>
    </div>
  )
}

