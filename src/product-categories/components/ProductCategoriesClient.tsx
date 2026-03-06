"use client"

import { CategoryPageClient } from "@/src/admins/categories/components/CategoryPageClient"
import { CategoryItem, CategorySaveDTO } from "@/src/admins/categories/types"
import { createClient } from "@/src/shared/lib/supabase/client"
import { useTranslations } from "next-intl"
import { ProductCategoriesService } from "../services/ProductCategoriesService"

export function ProductCategoriesClient({ categories }: { categories: CategoryItem[] }) {
  const t = useTranslations("Admins.productCategories.page")

  const handleSave = async (dto: CategorySaveDTO) => {
    const supabase = createClient()
    if (dto.id) {
      return ProductCategoriesService.updateProductCategory(
        { id: dto.id, name: dto.name, description: dto.description, imageUrl: dto.imageUrl },
        supabase,
      )
    }
    return ProductCategoriesService.createProductCategory(
      { name: dto.name, description: dto.description, imageUrl: dto.imageUrl },
      supabase,
    )
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    return ProductCategoriesService.deleteProductCategory(id, supabase)
  }

  return (
    <CategoryPageClient
      categories={categories}
      pageTitle={t("title")}
      pageSubtitle={t("subtitle")}
      bucketName="product-categories"
      onSave={handleSave}
      onDelete={handleDelete}
    />
  )
}
