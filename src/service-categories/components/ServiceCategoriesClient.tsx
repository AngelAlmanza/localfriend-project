"use client"

import { CategoryPageClient } from "@/src/admins/categories/components/CategoryPageClient"
import { CategoryItem, CategorySaveDTO } from "@/src/admins/categories/types"
import { createClient } from "@/src/shared/lib/supabase/client"
import { useTranslations } from "next-intl"
import { ServiceCategoriesService } from "../services/ServiceCategoriesService"

export function ServiceCategoriesClient({ categories }: { categories: CategoryItem[] }) {
  const t = useTranslations("Admins.serviceCategories.page")

  const handleSave = async (dto: CategorySaveDTO) => {
    const supabase = createClient()
    const result = dto.id
      ? await ServiceCategoriesService.updateServiceCategory(
          { id: dto.id, name: dto.name, description: dto.description, imageUrl: dto.imageUrl },
          supabase,
        )
      : await ServiceCategoriesService.createServiceCategory(
          { name: dto.name, description: dto.description, imageUrl: dto.imageUrl },
          supabase,
        )
    return result
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const result = await ServiceCategoriesService.deleteServiceCategory(id, supabase)
    return result
  }

  return (
    <CategoryPageClient
      categories={categories}
      pageTitle={t("title")}
      pageSubtitle={t("subtitle")}
      bucketName="service-categories"
      onSave={handleSave}
      onDelete={handleDelete}
    />
  )
}
