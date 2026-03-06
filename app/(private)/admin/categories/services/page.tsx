import { ServiceCategoriesClient } from "@/src/service-categories/components/ServiceCategoriesClient"
import { CategoryTableSkeleton } from "@/src/admins/categories/components/CategoryTableSkeleton"
import { ServiceCategoriesService } from "@/src/service-categories/services/ServiceCategoriesService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { CategoryItem } from "@/src/admins/categories/types"
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

  return <ServiceCategoriesClient categories={(categories ?? []) as CategoryItem[]} />
}

export default function ServiceCategoriesPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<CategoryTableSkeleton />}>
        <ServiceCategoriesContent />
      </Suspense>
    </div>
  )
}
