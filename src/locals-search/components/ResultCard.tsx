"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/src/shared/utils/formatCurrency"
import { Package, Wrench } from "lucide-react"
import { useTranslations } from "next-intl"
import { SearchResultItem } from "../interfaces/Local"
import { FavoriteButton } from "./FavoriteButton"

interface ResultCardProps {
  item: SearchResultItem
  onSelect: (item: SearchResultItem) => void
}

export const ResultCard = ({ item, onSelect }: ResultCardProps) => {
  const t = useTranslations("Locals.search")

  const priceDisplay = () => {
    if (item.minPrice == null) return t("card.noPrice")
    if (item.minPrice === item.maxPrice) return formatCurrency(item.minPrice)
    return `${formatCurrency(item.minPrice)} - ${formatCurrency(item.maxPrice!)}`
  }

  return (
    <Card
      className="gap-2 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden group"
      onClick={() => onSelect(item)}
      data-testid="search-result-card"
    >
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Badge
              variant="secondary"
              className="shrink-0 text-xs gap-1"
            >
              {item.type === "product" ? (
                <Package className="size-3" />
              ) : (
                <Wrench className="size-3" />
              )}
              {item.type === "product" ? t("card.product") : t("card.service")}
            </Badge>
            <span className="text-xs text-gray-400 truncate">
              {item.categoryName}
            </span>
          </div>
          <FavoriteButton
            type={item.type}
            listingId={item.id}
            isFavorited={item.isFavorited}
          />
        </div>
        <CardTitle className="text-lg font-bold text-gray-900 leading-tight mt-1">
          {item.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 pb-2">
        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {item.description}
          </p>
        )}
        <p className="text-xs text-gray-400">
          {t("card.by")} <span className="font-medium text-gray-600">{item.workerName}</span>
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        <span className="text-xs text-gray-400">
          {item.variants.length} {t("card.variants")}
        </span>
        <span className="text-base font-bold text-primary">
          {priceDisplay()}
        </span>
      </CardFooter>
    </Card>
  )
}
