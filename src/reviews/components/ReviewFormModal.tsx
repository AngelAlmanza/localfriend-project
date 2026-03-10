"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { buildReviewSchema, ReviewSchema } from "../schemas/review.schema"
import { Review } from "../interfaces/Review"
import { StarRating } from "./StarRating"

interface ReviewFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string | null) => Promise<boolean>
  isSubmitting: boolean
  existingReview: Review | null
}

const MAX_COMMENT_LENGTH = 500

const RATING_LABELS: Record<number, string> = {
  1: "Malo",
  2: "Regular",
  3: "Bueno",
  4: "Muy bueno",
  5: "Excelente",
}

export const ReviewFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  existingReview,
}: ReviewFormModalProps) => {
  const t = useTranslations("Locals.search.reviews")
  const isEditMode = existingReview !== null

  const schema = useMemo(
    () =>
      buildReviewSchema({
        ratingRequired: t("form.ratingRequired"),
        commentMax: t("form.commentMax"),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const form = useForm<ReviewSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? "",
    },
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({
        rating: existingReview?.rating ?? 0,
        comment: existingReview?.comment ?? "",
      })
    }
  }, [isOpen, existingReview, form])

  const handleClose = () => {
    form.reset({ rating: existingReview?.rating ?? 0, comment: existingReview?.comment ?? "" })
    onClose()
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values.rating, values.comment || null)
  })

  const currentRating = form.watch("rating")
  const currentComment = form.watch("comment")

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? t("form.editTitle") : t("form.title")}</DialogTitle>
          <DialogDescription>{t("form.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-1">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("form.ratingLabel")}</Label>
            <div className="flex flex-col items-center gap-2 py-4 bg-gray-50 rounded-lg border border-gray-100">
              <Controller
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <StarRating value={field.value} onChange={field.onChange} size="lg" />
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium text-amber-600 transition-opacity duration-150",
                  currentRating > 0 ? "opacity-100" : "opacity-0 select-none",
                )}
                aria-live="polite"
              >
                {RATING_LABELS[currentRating] ?? "–"}
              </span>
            </div>
            {form.formState.errors.rating && (
              <p className="text-xs text-destructive">{form.formState.errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment" className="text-sm font-medium">
              {t("form.commentLabel")}
            </Label>
            <Textarea
              id="review-comment"
              placeholder={t("form.commentPlaceholder")}
              rows={4}
              className="resize-none"
              {...form.register("comment")}
            />
            {form.formState.errors.comment && (
              <p className="text-xs text-destructive">{form.formState.errors.comment.message}</p>
            )}
            <p className="text-xs text-gray-400 text-right">
              {(currentComment ?? "").length}/{MAX_COMMENT_LENGTH}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={currentRating === 0 || isSubmitting}>
              {isSubmitting
                ? t("form.submitting")
                : isEditMode
                  ? t("form.editSubmit")
                  : t("form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
