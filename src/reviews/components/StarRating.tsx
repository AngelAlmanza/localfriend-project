"use client"

import { cn } from "@/lib/utils"
import { Star } from "lucide-react"
import { useState } from "react"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "size-3.5",
  md: "size-5",
  lg: "size-7",
}

const gapClasses = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
}

export const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) => {
  const [hovered, setHovered] = useState(0)
  const active = !readonly && hovered > 0 ? hovered : value

  if (readonly) {
    return (
      <div
        className={cn("flex items-center", gapClasses[size], className)}
        role="img"
        aria-label={`${value} de 5 estrellas`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            aria-hidden="true"
            className={cn(
              sizeClasses[size],
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-gray-200"
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn("flex items-center", gapClasses[size], className)}
      role="radiogroup"
      aria-label="Calificación"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHovered(star)}
          className="rounded-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1"
        >
          <Star
            aria-hidden="true"
            className={cn(
              sizeClasses[size],
              "transition-colors duration-100",
              star <= active
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-gray-200"
            )}
          />
        </button>
      ))}
    </div>
  )
}
