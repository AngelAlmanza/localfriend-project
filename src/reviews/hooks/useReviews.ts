"use client"

import { createClient } from "@/src/shared/lib/supabase/client"
import { useUserContext } from "@/src/shared/providers/UserProvider"
import { SearchListingType } from "@/src/locals-search/interfaces/Local"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Review } from "../interfaces/Review"
import { ReviewsService } from "../services/ReviewsService"

interface UseReviewsReturn {
  reviews: Review[]
  userReview: Review | null
  isLoading: boolean
  isSubmitting: boolean
  submitReview: (rating: number, comment: string | null) => Promise<boolean>
}

export const useReviews = (
  listingId: string,
  listingType: SearchListingType,
): UseReviewsReturn => {
  const supabase = useMemo(() => createClient(), [])
  const { user } = useUserContext()

  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchReviews = async () => {
      setIsLoading(true)
      const { right } = await ReviewsService.getListingReviews(
        listingType,
        listingId,
        user.id,
        supabase,
      )
      if (right) {
        setReviews(right.reviews)
        setUserReview(right.userReview)
      }
      setIsLoading(false)
    }

    fetchReviews()
  }, [listingId, listingType, user, supabase])

  const submitReview = useCallback(
    async (rating: number, comment: string | null): Promise<boolean> => {
      if (!user) return false

      setIsSubmitting(true)
      const { right } = await ReviewsService.upsertReview(
        listingType,
        listingId,
        user.id,
        rating,
        comment,
        supabase,
      )
      setIsSubmitting(false)

      if (right) {
        setReviews((prev) => {
          const others = prev.filter((r) => !r.isOwn)
          return [right, ...others]
        })
        setUserReview(right)
        return true
      }

      return false
    },
    [user, listingType, listingId, supabase],
  )

  return { reviews, userReview, isLoading, isSubmitting, submitReview }
}
