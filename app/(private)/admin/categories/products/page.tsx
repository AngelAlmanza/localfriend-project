import { ProductCategoriesClient } from "@/src/product-categories/components/ProductCategoriesClient"
import { CategoryTableSkeleton } from "@/src/admins/categories/components/CategoryTableSkeleton"
import { ProductCategoriesService } from "@/src/product-categories/services/ProductCategoriesService"
import { createClient } from "@/src/shared/lib/supabase/server"
import { CategoryItem } from "@/src/admins/categories/types"
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

  return <ProductCategoriesClient categories={(categories ?? []) as CategoryItem[]} />
}

export default function ProductCategoriesPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<CategoryTableSkeleton />}>
        <ProductCategoriesContent />
      </Suspense>
    </div>
  )
}
