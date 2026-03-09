"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Heart, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { SearchListingType } from "../interfaces/Local"
import { useFavoriteToggle } from "../hooks/useFavorites"

interface FavoriteButtonProps {
  type: SearchListingType
  listingId: string
  isFavorited: boolean
  variant?: "icon" | "overlay"
}

export const FavoriteButton = ({
  type,
  listingId,
  isFavorited,
  variant = "icon",
}: FavoriteButtonProps) => {
  const t = useTranslations("Locals.search")
  const { toggle, isToggling } = useFavoriteToggle()
  const loading = isToggling(listingId)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggle(type, listingId)
  }

  if (variant === "overlay") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="cursor-pointer rounded-full bg-white/90 hover:bg-white shadow-sm"
            onClick={handleClick}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart
                className={cn(
                  "size-4 transition-colors",
                  isFavorited ? "fill-red-500 text-red-500" : "text-gray-600",
                )}
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isFavorited ? t("favorite.remove") : t("favorite.add")}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="cursor-pointer"
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Heart
              className={cn(
                "size-4 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400",
              )}
            />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isFavorited ? t("favorite.remove") : t("favorite.add")}</p>
      </TooltipContent>
    </Tooltip>
  )
}
