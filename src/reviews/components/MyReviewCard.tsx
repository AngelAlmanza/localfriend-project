"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/src/shared/utils/dateUtils"
import { ArrowUpRight, Package, Pencil, Wrench } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { UserReview } from "../interfaces/Review"
import { StarRating } from "./StarRating"

interface MyReviewCardProps {
  review: UserReview
  onEdit: (review: UserReview) => void
}

export const MyReviewCard = ({ review, onEdit }: MyReviewCardProps) => {
  const t = useTranslations("Locals.reviews")

  const detailHref =
    review.listingType === "product"
      ? `/locals/products/${review.listingId}`
      : `/locals/services/${review.listingId}`

  return (
    <Card className="group transition-shadow hover:shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* Header row: type badge + listing name + link */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <Badge
              variant="secondary"
              className="shrink-0 gap-1 text-xs mt-0.5"
            >
              {review.listingType === "product" ? (
                <Package className="size-3" aria-hidden="true" />
              ) : (
                <Wrench className="size-3" aria-hidden="true" />
              )}
              {review.listingType === "product" ? t("card.product") : t("card.service")}
            </Badge>
            <Link
              href={detailHref}
              className="text-sm font-semibold text-gray-900 leading-snug truncate hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {review.listingName}
            </Link>
          </div>
          <Link
            href={detailHref}
            aria-label={t("card.viewListing")}
            className="shrink-0 flex items-center justify-center size-7 rounded-md text-gray-400 hover:text-primary hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Stars + date */}
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readonly size="sm" />
          <span className="text-xs text-gray-400">
            {formatDate(review.createdAt, undefined, "D MMM YYYY")}
          </span>
        </div>

        {/* Comment */}
        {review.comment && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.comment}</p>
        )}

        {/* Edit button */}
        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs h-7 text-gray-500 hover:text-gray-900"
            onClick={() => onEdit(review)}
          >
            <Pencil className="size-3" aria-hidden="true" />
            {t("card.editReview")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
