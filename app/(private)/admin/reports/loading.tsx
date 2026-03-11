import { Skeleton } from "@/components/ui/skeleton"

const COLUMN_ACCENTS = [
  "border-t-amber-300",
  "border-t-blue-300",
  "border-t-gray-300",
]

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Kanban skeleton — mirrors the real board layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMN_ACCENTS.map((accent, i) => (
          <div
            key={i}
            className={`rounded-xl border border-t-[3px] bg-gray-50/60 overflow-hidden ${accent}`}
          >
            {/* Column header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-5 rounded-full" />
            </div>

            {/* Cards */}
            <div className="p-3 space-y-2.5">
              {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }).map((_, j) => (
                <div
                  key={j}
                  className="rounded-lg border border-l-[3px] border-gray-200 border-l-gray-300 bg-white p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <div className="flex items-center justify-between pt-0.5">
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
