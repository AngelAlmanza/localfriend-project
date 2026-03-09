"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency } from "@/src/shared/utils/formatCurrency"
import { Mail, Package, UserCircle, Wrench, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { SearchResultDetail } from "../interfaces/Local"
import { FavoriteButton } from "./FavoriteButton"

interface ResultDetailSectionProps {
  detail: SearchResultDetail | null
  isLoading: boolean
  onClose: () => void
}

export const ResultDetailSection = ({
  detail,
  isLoading,
  onClose,
}: ResultDetailSectionProps) => {
  const t = useTranslations("Locals.search")

  if (isLoading) {
    return (
      <Card className="w-full lg:w-3/5 h-fit gap-0 overflow-hidden">
        <CardHeader className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!detail) {
    return (
      <section className="w-full lg:w-3/5 pr-4 overflow-y-auto h-[calc(100vh-16rem)]" data-testid="search-detail-empty">
        <div className="h-full border-dotted border-2 border-gray-200 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">{t("noSelectedResult")}</p>
          </div>
        </div>
      </section>
    )
  }

  const priceDisplay = () => {
    if (detail.minPrice == null) return t("card.noPrice")
    if (detail.minPrice === detail.maxPrice) return formatCurrency(detail.minPrice)
    return `${formatCurrency(detail.minPrice)} - ${formatCurrency(detail.maxPrice!)}`
  }

  return (
    <Card className="w-full lg:w-3/5 h-fit gap-0 overflow-hidden" data-testid="search-detail">
      <CardHeader className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              {detail.type === "product" ? (
                <Package className="size-3" />
              ) : (
                <Wrench className="size-3" />
              )}
              {detail.type === "product" ? t("card.product") : t("card.service")}
            </Badge>
            <span className="text-xs text-gray-400">{detail.categoryName}</span>
          </div>
          <div className="flex items-center gap-1">
            <FavoriteButton
              type={detail.type}
              listingId={detail.id}
              isFavorited={detail.isFavorited}
              variant="icon"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("detail.close")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <CardTitle className="text-2xl font-bold text-gray-900 mt-2">
          {detail.name}
        </CardTitle>
        <div className="text-xl font-bold text-primary">
          {priceDisplay()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {detail.description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {detail.description}
          </p>
        )}

        <Separator />

        {/* Worker info */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            {t("detail.publisher")}
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-gray-100">
              <UserCircle className="size-6 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{detail.workerName}</p>
            </div>
          </div>
        </div>

        {/* Variants */}
        {detail.variants.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">
              {t("detail.variantsTitle")}
            </h3>
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-xs">{t("detail.variantsTable.name")}</TableHead>
                  <TableHead className="text-xs">{t("detail.variantsTable.price")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="text-sm text-gray-600 font-medium">
                      {variant.name}
                    </TableCell>
                    <TableCell className="text-sm text-primary font-bold">
                      {variant.price != null
                        ? formatCurrency(variant.price)
                        : variant.priceMin != null
                          ? `${formatCurrency(variant.priceMin)}${variant.priceMax ? ` - ${formatCurrency(variant.priceMax)}` : ""}`
                          : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Separator />

        {/* Contact */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            {t("detail.contact")}
          </h3>
          <div className="flex gap-2">
            {detail.workerEmail && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    asChild
                  >
                    <a href={`mailto:${detail.workerEmail}`}>
                      <Mail className="size-3.5" />
                      {t("detail.contactEmail")}
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{detail.workerEmail}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
