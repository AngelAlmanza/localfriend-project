"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/src/shared/lib/supabase/client"
import { useUserContext } from "@/src/shared/providers/UserProvider"
import { Bookmark, Clock, Heart, SearchIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { FavoriteItem, RecentlyViewedItem, SearchListingType } from "../../locals-search/interfaces/Local"
import { FavoritesService } from "../../locals-search/services/FavoritesService"
import { RecentCard } from "../../locals-search/components/RecentCard"
import { FavoriteCard } from "./FavoriteCard"
import { toast } from "sonner"

interface FavoritesPageClientProps {
  initialFavorites: FavoriteItem[]
  initialRecentlyViewed: RecentlyViewedItem[]
}

export const FavoritesPageClient = ({
  initialFavorites,
  initialRecentlyViewed,
}: FavoritesPageClientProps) => {
  const t = useTranslations("Locals.favorites")
  const supabase = useMemo(() => createClient(), [])
  const { user } = useUserContext()

  // IDs that have been toggled from their initial "favorited" state.
  // Present in set → currently NOT favorited; absent → currently favorited.
  const [unfavoritedIds, setUnfavoritedIds] = useState<Set<string>>(new Set())
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  const handleToggle = useCallback(
    async (type: SearchListingType, listingId: string) => {
      if (!user || togglingIds.has(listingId)) return

      setTogglingIds((prev) => new Set(prev).add(listingId))

      const currentlyFavorited = !unfavoritedIds.has(listingId)
      const { left } = await FavoritesService.toggleFavorite(type, listingId, user.id, supabase)

      if (left) {
        toast.error(t("toast.error"))
      } else {
        if (currentlyFavorited) {
          setUnfavoritedIds((prev) => new Set(prev).add(listingId))
          toast.success(t("toast.removed"))
        } else {
          setUnfavoritedIds((prev) => {
            const next = new Set(prev)
            next.delete(listingId)
            return next
          })
          toast.success(t("toast.added"))
        }
      }

      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(listingId)
        return next
      })
    },
    [user, supabase, unfavoritedIds, togglingIds, t],
  )

  const isEmpty = initialFavorites.length === 0 && initialRecentlyViewed.length === 0

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="favorites-empty">
        <Bookmark className="size-12 text-gray-300 mb-4" />
        <p className="text-lg font-medium text-gray-600">{t("empty.title")}</p>
        <p className="text-sm text-gray-400 mt-1">{t("empty.subtitle")}</p>
        <Button asChild className="mt-4">
          <Link href="/locals/search">
            <SearchIcon className="size-4 mr-1.5" />
            {t("empty.cta")}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8" data-testid="favorites-page">
      {/* Favorites section */}
      {initialFavorites.length > 0 && (
        <section data-testid="favorites-section">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="size-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">
              {t("section.favorites")}
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({initialFavorites.length})
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialFavorites.map((fav) => (
              <FavoriteCard
                key={fav.id}
                item={fav}
                isFavorited={!unfavoritedIds.has(fav.listingId)}
                isToggling={togglingIds.has(fav.listingId)}
                onToggle={() => handleToggle(fav.type, fav.listingId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed section */}
      {initialRecentlyViewed.length > 0 && (
        <section data-testid="recently-viewed-section">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">
              {t("section.recentlyViewed")}
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({initialRecentlyViewed.length})
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialRecentlyViewed.map((item) => (
              <RecentCard
                key={`${item.type}-${item.listingId}`}
                item={item}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
