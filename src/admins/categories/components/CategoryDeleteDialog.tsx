"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";
import { CategoryItem } from "../types";

type Props = {
  isDeleting: boolean;
  deleteTarget: CategoryItem | null;
  handleDeleteConfirm: () => void;
  handleOpenChange: (open: boolean) => void;
}

export const CategoryDeleteDialog = ({
  handleDeleteConfirm,
  handleOpenChange,
  isDeleting,
  deleteTarget,
}: Props) => {
  const t = useTranslations("Admins.categories")

  return (
    <AlertDialog open={!!deleteTarget} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDialog.description", { name: deleteTarget?.name ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("deleteDialog.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            variant="destructive"
          >
            {t("deleteDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
