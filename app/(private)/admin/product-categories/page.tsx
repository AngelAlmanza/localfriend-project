import { ProductCategoriesPageClient } from "@/src/product-categories/components/ProductCategoriesPageClient"
import { ProductCategoriesTableSkeleton } from "@/src/product-categories/components/ProductCategoriesTableSkeleton"
import { ProductCategoriesService } from "@/src/product-categories/services/ProductCategoriesService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { Suspense } from "react"

async function ProductCategoriesContent() {
  const supabase = await createClient()
  const { right: categories, left: error } = await ProductCategoriesService.getProductCategories(supabase)

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
        <p className="font-medium">{error.message}</p>
      </div>
    )
  }

  return <ProductCategoriesPageClient categories={categories ?? []} />
}

export default function ProductCategoriesPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<ProductCategoriesTableSkeleton />}>
        <ProductCategoriesContent />
      </Suspense>
    </div>
  )
}
