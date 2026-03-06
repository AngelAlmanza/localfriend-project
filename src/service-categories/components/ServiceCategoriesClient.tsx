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
    if (dto.id) {
      return ServiceCategoriesService.updateServiceCategory(
        { id: dto.id, name: dto.name, description: dto.description, imageUrl: dto.imageUrl },
        supabase,
      )
    }
    return ServiceCategoriesService.createServiceCategory(
      { name: dto.name, description: dto.description, imageUrl: dto.imageUrl },
      supabase,
    )
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    return ServiceCategoriesService.deleteServiceCategory(id, supabase)
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
