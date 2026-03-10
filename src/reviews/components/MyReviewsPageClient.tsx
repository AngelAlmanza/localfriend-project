"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/src/shared/lib/supabase/client"
import { useUserContext } from "@/src/shared/providers/UserProvider"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Review, UserReview } from "../interfaces/Review"
import { ReviewsService } from "../services/ReviewsService"
import { MyReviewCard } from "./MyReviewCard"
import { ReviewFormModal } from "./ReviewFormModal"

interface MyReviewsPageClientProps {
  initialReviews: UserReview[]
}

export const MyReviewsPageClient = ({ initialReviews }: MyReviewsPageClientProps) => {
  const t = useTranslations("Locals.reviews")
  const tSearch = useTranslations("Locals.search.reviews")
  const supabase = useMemo(() => createClient(), [])
  const { user } = useUserContext()

  const [reviews, setReviews] = useState<UserReview[]>(initialReviews)
  const [editingReview, setEditingReview] = useState<UserReview | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = (review: UserReview) => {
    setEditingReview(review)
  }

  const handleSubmit = async (rating: number, comment: string | null): Promise<boolean> => {
    if (!user || !editingReview) return false

    setIsSubmitting(true)
    const { right } = await ReviewsService.upsertReview(
      editingReview.listingType,
      editingReview.listingId,
      user.id,
      rating,
      comment,
      supabase,
    )
    setIsSubmitting(false)

    if (right) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id ? { ...r, rating, comment } : r,
        ),
      )
      toast.success(tSearch("form.updateSuccess"))
      setEditingReview(null)
      return true
    }

    toast.error(tSearch("form.error"))
    return false
  }

  // Convert UserReview → Review shape for the modal (only rating + comment matter)
  const modalReview: Review | null = editingReview
    ? {
        id: editingReview.id,
        authorName: "",
        rating: editingReview.rating,
        comment: editingReview.comment,
        createdAt: editingReview.createdAt,
        isOwn: true,
      }
    : null

  return (
    <>
      {/* Page header */}
      <div className="mb-6 space-y-1">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{t("page.title")}</h1>
          {reviews.length > 0 && (
            <span className="text-sm text-gray-400 tabular-nums">
              {reviews.length === 1
                ? t("page.reviewCount", { count: reviews.length })
                : t("page.reviewCountPlural", { count: reviews.length })}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{t("page.subtitle")}</p>
      </div>

      {reviews.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="flex items-center justify-center size-16 rounded-full bg-amber-50">
            {/* Simple star illustration */}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-8 text-amber-400"
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-gray-700">{t("empty.title")}</p>
            <p className="text-sm text-gray-400 max-w-xs">{t("empty.subtitle")}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/locals/search">{t("empty.cta")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <MyReviewCard key={review.id} review={review} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <ReviewFormModal
        isOpen={editingReview !== null}
        onClose={() => setEditingReview(null)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        existingReview={modalReview}
      />
    </>
  )
}
