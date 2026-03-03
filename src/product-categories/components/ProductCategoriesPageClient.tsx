"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/src/shared/lib/supabase/client"
import { StorageService } from "@/src/shared/services/StorageService"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { ProductCategoryResponse } from "../interfaces/responses"
import { ProductCategoriesService } from "../services/ProductCategoriesService"
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog"
import { ProductCategoriesForm } from "./ProductCategoriesForm"
import { ProductCategoriesTable } from "./ProductCategoriesTable"

interface ProductCategoriesPageClientProps {
  categories: ProductCategoryResponse[]
}

const EMPTY_FORM = { name: "", description: "", imageUrl: "" }

export function ProductCategoriesPageClient({
  categories,
}: ProductCategoriesPageClientProps) {
  const t = useTranslations("Admins.productCategories")
  const router = useRouter()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProductCategoryResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductCategoryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAdd = () => {
    setEditTarget(null)
    setIsModalOpen(true)
  }

  const handleEdit = (category: ProductCategoryResponse) => {
    setEditTarget(category)
    setIsModalOpen(true)
  }

  const handleDeleteRequest = (category: ProductCategoryResponse) => {
    setDeleteTarget(category)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const supabase = createClient()

    if (deleteTarget.imageUrl) {
      const path = StorageService.getPathFromUrl(deleteTarget.imageUrl, "product-categories")
      if (path) await StorageService.deleteFile("product-categories", path, supabase)
    }

    const { left } = await ProductCategoriesService.deleteProductCategory(deleteTarget.id, supabase)
    setIsDeleting(false)
    setDeleteTarget(null)
    if (left) {
      toast.error(left.message ?? t("form.productCategoryDeleteFailed"))
    } else {
      toast.success(t("form.productCategoryDeletedSuccessfully"))
      router.refresh()
    }
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    setEditTarget(null)
    router.refresh()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) setDeleteTarget(null)
  }

  const modalTitle = editTarget ? t("modal.editTitle") : t("modal.addTitle")
  const formInitialValues = editTarget
    ? { name: editTarget.name, description: editTarget.description ?? "", imageUrl: editTarget.imageUrl ?? "" }
    : EMPTY_FORM

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("page.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("page.subtitle")}</p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <Plus />
          {t("page.addButton")}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <ProductCategoriesTable
          categories={categories}
          handleDeleteRequest={handleDeleteRequest}
          handleEdit={handleEdit}
        />
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <ProductCategoriesForm
            key={editTarget?.id ?? "new"}
            id={editTarget?.id ?? null}
            initialValues={formInitialValues}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isDeleting={isDeleting}
        deleteTarget={deleteTarget}
        handleDeleteConfirm={handleDeleteConfirm}
        handleOpenChange={handleOpenChange}
      />
    </div>
  )
}
