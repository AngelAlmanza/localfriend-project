import { ServicesPageClient } from "@/src/workers-listings/components/services/ServicesPageClient"
import { ListingTableSkeleton } from "@/src/workers-listings/components/shared/ListingTableSkeleton"
import { ServicesService } from "@/src/workers-listings/services/ServicesService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { Suspense } from "react"

async function ServicesContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
        <p className="font-medium">No authenticated user found.</p>
      </div>
    )
  }

  const { right: data, left: error } = await ServicesService.getWorkerServices(user.id, supabase)

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
        <p className="font-medium">{error.message}</p>
      </div>
    )
  }

  return <ServicesPageClient initialData={data!} />
}

export default function ServicesPage() {
  return (
    <div className="p-2 sm:p-6">
      <Suspense fallback={<ListingTableSkeleton columns={7} />}>
        <ServicesContent />
      </Suspense>
    </div>
  )
}
