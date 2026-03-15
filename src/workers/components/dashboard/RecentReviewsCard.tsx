"use client"

import { useTranslations } from "next-intl"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardReview } from "../../interfaces/Dashboard"
import { Star, MessageCircle, Package, Wrench } from "lucide-react"

interface RecentReviewsCardProps {
  reviews: DashboardReview[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  )
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `${diffDays}d`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`
  return `${Math.floor(diffDays / 30)}m`
}

export function RecentReviewsCard({ reviews }: RecentReviewsCardProps) {
  const t = useTranslations("Workers.dashboard.reviews")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
          <MessageCircle className="size-4 text-amber-600" />
        </div>
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const TypeIcon = review.listingType === "product" ? Package : Wrench
              return (
                <div
                  key={review.id}
                  className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <TypeIcon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate text-sm font-medium">{review.authorName}</span>
                        <StarRating rating={review.rating} />
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeDate(review.createdAt)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {review.listingType === "product" ? t("product") : t("service")}
                      </Badge>
                      <span className="truncate text-xs text-muted-foreground">
                        {review.listingName}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
