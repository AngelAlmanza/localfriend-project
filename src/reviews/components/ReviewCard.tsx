import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDate } from "@/src/shared/utils/dateUtils"
import { useTranslations } from "next-intl"
import { Review } from "../interfaces/Review"
import { StarRating } from "./StarRating"

interface ReviewCardProps {
  review: Review
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export const ReviewCard = ({ review, className }: ReviewCardProps) => {
  const t = useTranslations("Locals.search.reviews")
  const initials = getInitials(review.authorName)

  return (
    <div className={cn("flex flex-col gap-2 py-3", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar size="default" className="shrink-0">
            <AvatarFallback className="bg-amber-50 text-amber-700 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-gray-900 truncate">{review.authorName}</p>
              {review.isOwn && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 bg-amber-50 text-amber-700 border-amber-200 shrink-0"
                >
                  {t("yourReview")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {formatDate(review.createdAt, undefined, "D MMM YYYY")}
            </p>
          </div>
        </div>
        <StarRating value={review.rating} readonly size="sm" className="shrink-0 mt-0.5" />
      </div>
      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed pl-10">{review.comment}</p>
      )}
    </div>
  )
}
