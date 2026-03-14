import { Skeleton } from "@/components/ui/skeleton"

export default function SubscriptionLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* SubscriptionStatusCard */}
      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-56" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Grid: PaymentMethodsSection + InvoicesList */}
      <div className="grid grid-cols-2 gap-4">
        {/* PaymentMethodsSection skeleton */}
        <div className="rounded-xl border p-6 space-y-3">
          <Skeleton className="h-4 w-36" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="size-8 rounded" />
                <Skeleton className="size-8 rounded" />
              </div>
            </div>
          ))}
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* InvoicesList skeleton */}
        <div className="rounded-xl border p-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 pb-2 border-b">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-3.5 w-full" />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 py-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-6 w-6 ml-auto rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
