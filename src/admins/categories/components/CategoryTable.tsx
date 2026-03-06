import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import moment from "moment-timezone"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { CategoryItem } from "../types"

type Props = {
  categories: CategoryItem[]
  handleEdit: (category: CategoryItem) => void
  handleDeleteRequest: (category: CategoryItem) => void
}

export const CategoryTable = ({ categories, handleDeleteRequest, handleEdit }: Props) => {
  const t = useTranslations("Admins.categories")

  const formatDate = (dateStr: string) => {
    return moment.tz(dateStr, moment.tz.guess()).format("DD/MM/YYYY HH:mm")
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-50">{t("table.name")}</TableHead>
          <TableHead>{t("table.description")}</TableHead>
          <TableHead className="w-45">{t("table.updatedAt")}</TableHead>
          <TableHead className="w-30 text-right">{t("table.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-40 text-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <span className="text-base font-medium">{t("table.noData")}</span>
                <span className="text-sm">{t("table.noDataDescription")}</span>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium flex items-center gap-4">
                <div className="relative h-10 w-10">
                  <Image
                    src={category.imageUrl}
                    alt={`Image of ${category.name}`}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                {category.name}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">
                {category.description || t("table.noDescription")}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(category.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEdit(category)}
                    aria-label={t("table.edit")}
                    title={t("table.edit")}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeleteRequest(category)}
                    aria-label={t("table.delete")}
                    title={t("table.delete")}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
