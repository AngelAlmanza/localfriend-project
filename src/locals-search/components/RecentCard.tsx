import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/src/shared/utils/formatCurrency"
import { Package, Wrench } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { RecentlyViewedItem } from "../interfaces/Local"

interface RecentCardProps {
  item: RecentlyViewedItem
}

export const RecentCard = ({ item }: RecentCardProps) => {
  const t = useTranslations("Locals.favorites")

  const priceDisplay = () => {
    if (item.minPrice == null) return "-"
    if (item.minPrice === item.maxPrice) return formatCurrency(item.minPrice)
    return `${formatCurrency(item.minPrice)} - ${formatCurrency(item.maxPrice!)}`
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200 opacity-80 hover:opacity-100">
      <CardHeader className="pb-1">
        <Badge variant="outline" className="text-xs gap-1 w-fit">
          {item.type === "product" ? (
            <Package className="size-3" />
          ) : (
            <Wrench className="size-3" />
          )}
          {item.categoryName}
        </Badge>
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