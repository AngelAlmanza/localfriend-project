"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchListingType } from "@/src/locals-search/interfaces/Local"
import { Pencil, PenLine } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { useReviews } from "../hooks/useReviews"
import { ReviewCard } from "./ReviewCard"
import { ReviewFormModal } from "./ReviewFormModal"
import { StarRating } from "./StarRating"

interface ReviewsSectionProps {
  listingId: string
  listingType: SearchListingType
  /** Show only the first 2 reviews (used in the sidebar split-view panel) */
  compact?: boolean
}

function calcAverage(ratings: number[]): number {
  if (ratings.length === 0) return 0
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
}

export const ReviewsSection = ({
  listingId,
  listingType,
  compact = false,
}: ReviewsSectionProps) => {
  const t = useTranslations("Locals.search.reviews")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { reviews, userReview, isLoading, isSubmitting, submitReview } = useReviews(
    listingId,
    listingType,
  )

  const average = calcAverage(reviews.map((r) => r.rating))
  const visibleReviews = compact ? reviews.slice(0, 2) : reviews
  const hiddenCount = reviews.length - visibleReviews.length

  const handleSubmit = async (rating: number, comment: string | null): Promise<boolean> => {
    const success = await submitReview(rating, comment)
    if (success) {
      toast.success(userReview ? t("form.updateSuccess") : t("form.success"))
      setIsModalOpen(false)
    } else {
      toast.error(t("form.error"))
    }
    return success
  }

  return (
    <>
      <Separator />

      <section className="space-y-3" aria-labelledby="reviews-heading">
        <div className="flex items-center justify-between">
          <h3 id="reviews-heading" className="text-sm font-semibold text-gray-900">
            {t("title")}
          </h3>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs h-8"
            onClick={() => setIsModalOpen(true)}
          >
            {userReview ? (
              <Pencil className="size-3.5" aria-hidden="true" />
            ) : (
              <PenLine className="size-3.5" aria-hidden="true" />
            )}
            {userReview ? t("editReview") : t("writeReview")}
          </Button>
        </div>

        {isLoading ? (
          <ReviewsSkeleton />
        ) : reviews.length === 0 ? (
          <div className="py-6 text-center space-y-1 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-sm font-medium text-gray-600">{t("noReviews")}</p>
            <p className="text-xs text-gray-400">{t("noReviewsSubtitle")}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-2xl font-bold text-amber-700 tabular-nums">{average}</span>
              <div className="space-y-0.5">
                <StarRating value={Math.round(average)} readonly size="sm" />
                <p className="text-xs text-amber-600">
                  {reviews.length === 1
                    ? t("reviewCount", { count: reviews.length })
                    : t("reviewCountPlural", { count: reviews.length })}
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {compact && hiddenCount > 0 && (
              <p className="text-xs text-center text-gray-400 pt-0.5">
                {t("moreReviews", { count: hiddenCount })}
              </p>
            )}
          </>
        )}
      </section>

      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        existingReview={userReview}
      />
    </>
  )
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="divide-y divide-gray-100">
        {[0, 1].map((i) => (
          <div key={i} className="py-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-3.5 w-20" />
            </div>
            <Skeleton className="h-8 w-5/6 ml-10" />
          </div>
        ))}
      </div>
    </div>
  )
}
