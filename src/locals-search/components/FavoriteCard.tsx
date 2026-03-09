import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/src/shared/utils/formatCurrency"
import { Heart, Loader2, Package, Wrench } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { FavoriteItem } from "../interfaces/Local"

interface FavoriteCardProps {
  item: FavoriteItem
  isRemoving: boolean
  onRemove: () => void
}

export const FavoriteCard = ({ item, isRemoving, onRemove }: FavoriteCardProps) => {
  const t = useTranslations("Locals.favorites")

  const priceDisplay = () => {
    if (item.minPrice == null) return "-"
    if (item.minPrice === item.maxPrice) return formatCurrency(item.minPrice)
    return `${formatCurrency(item.minPrice)} - ${formatCurrency(item.maxPrice!)}`
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200 group">
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="text-xs gap-1">
            {item.type === "product" ? (
              <Package className="size-3" />
            ) : (
              <Wrench className="size-3" />
            )}
            {item.categoryName}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            disabled={isRemoving}
            className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isRemoving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart className="size-4 fill-red-500 text-red-500" />
            )}
          </Button>
        </div>
        <CardTitle className="text-lg font-bold text-gray-900 leading-tight mt-1">
          <Link
            href={`/locals/${item.type === "product" ? "products" : "services"}/${item.listingId}`}
            className="hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pb-2">
        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
        )}
        <p className="text-xs text-gray-400">
          {t("card.by")} <span className="font-medium text-gray-600">{item.workerName}</span>
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <span className="text-base font-bold text-primary">{priceDisplay()}</span>
      </CardFooter>
    </Card>
  )
}