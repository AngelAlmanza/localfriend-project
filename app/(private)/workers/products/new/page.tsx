import { ProductForm } from "@/src/workers-listings/components/products/ProductForm"
import { ProductCategoriesService } from "@/src/product-categories/services/ProductCategoriesService"
import { createClient } from "@/src/shared/lib/supabase/server"

export default async function NewProductPage() {
  const supabase = await createClient()
  const { right: categories, left: error } = await ProductCategoriesService.getProductCategories(supabase)

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
      <ProductForm categories={categories ?? []} />
    </div>
  )
}
