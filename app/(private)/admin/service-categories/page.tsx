import { ServiceCategoriesPageClient } from "@/src/service-categories/components/ServiceCategoriesPageClient"
import { ServiceCategoriesTableSkeleton } from "@/src/service-categories/components/ServiceCategoriesTableSkeleton"
import { ServiceCategoriesService } from "@/src/service-categories/services/ServiceCategoriesService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { Suspense } from "react"

async function ServiceCategoriesContent() {
  const supabase = await createClient()
  const { right: categories, left: error } = await ServiceCategoriesService.getServiceCategories(supabase)

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
        <p className="font-medium">{error.message}</p>
      </div>
    )
  }

  return <ServiceCategoriesPageClient categories={categories ?? []} />
}

export default function ServiceCategoriesPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<ServiceCategoriesTableSkeleton />}>
        <ServiceCategoriesContent />
      </Suspense>
    </div>
  )
}
