"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ISystemError } from "@/src/shared/interfaces/ISystemError"
import { createClient } from "@/src/shared/lib/supabase/client"
import { StorageService } from "@/src/shared/services/StorageService"
import { Either } from "@/src/shared/types/either"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { CategorySaveDTO, CategoryItem } from "../types"
import { CategoryDeleteDialog } from "./CategoryDeleteDialog"
import { CategoryForm } from "./CategoryForm"
import { CategoryTable } from "./CategoryTable"

const EMPTY_FORM = { name: "", description: "", imageUrl: "" }

interface CategoryPageClientProps {
  categories: CategoryItem[]
  pageTitle: string
  pageSubtitle: string
  bucketName: string
  onSave: (dto: CategorySaveDTO) => Promise<Either<ISystemError, CategoryItem>>
  onDelete: (id: string) => Promise<Either<ISystemError, boolean>>
}

export function CategoryPageClient({
  categories,
  pageTitle,
  pageSubtitle,
  bucketName,
  onSave,
  onDelete,
}: CategoryPageClientProps) {
  const t = useTranslations("Admins.categories")
  const router = useRouter()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CategoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAdd = () => {
    setEditTarget(null)
    setIsModalOpen(true)
  }

  const handleEdit = (category: CategoryItem) => {
    setEditTarget(category)
    setIsModalOpen(true)
  }

  const handleDeleteRequest = (category: CategoryItem) => {
    setDeleteTarget(category)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const supabase = createClient()

    if (deleteTarget.imageUrl) {
      const path = StorageService.getPathFromUrl(deleteTarget.imageUrl, bucketName)
      if (path) await StorageService.deleteFile(bucketName, path, supabase)
    }

    const { left } = await onDelete(deleteTarget.id)
    setIsDeleting(false)
    setDeleteTarget(null)
    if (left) {
      toast.error(left.message ?? t("form.deleteFailed"))
    } else {
      toast.success(t("form.deletedSuccessfully"))
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
          <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{pageSubtitle}</p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <Plus />
          {t("page.addButton")}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <CategoryTable
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
          <CategoryForm
            key={editTarget?.id ?? "new"}
            id={editTarget?.id ?? null}
            initialValues={formInitialValues}
            bucketName={bucketName}
            onSave={onSave}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <CategoryDeleteDialog
        isDeleting={isDeleting}
        deleteTarget={deleteTarget}
        handleDeleteConfirm={handleDeleteConfirm}
        handleOpenChange={handleOpenChange}
      />
    </div>
  )
}
