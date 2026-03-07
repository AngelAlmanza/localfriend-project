import { ServiceForm } from "@/src/workers-listings/components/services/ServiceForm"
import { ServiceCategoriesService } from "@/src/service-categories/services/ServiceCategoriesService"
import { createClient } from "@/src/shared/lib/supabase/server"

export default async function NewServicePage() {
  const supabase = await createClient()
  const { right: categories, left: error } = await ServiceCategoriesService.getServiceCategories(supabase)

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
          <p className="font-medium">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-6">
      <ServiceForm categories={categories ?? []} />
    </div>
  )
}
