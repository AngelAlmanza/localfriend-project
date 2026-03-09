"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/src/shared/lib/supabase/client"
import { useUserContext } from "@/src/shared/providers/UserProvider"
import { Bookmark, Clock, Heart, SearchIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { FavoriteItem, RecentlyViewedItem, SearchListingType } from "../interfaces/Local"
import { FavoritesService } from "../services/FavoritesService"
import { FavoriteCard } from "./FavoriteCard"
import { FavoriteCardSkeleton } from "./FavoriteCardSkeleton"
import { RecentCard } from "./RecentCard"

export const FavoritesPageClient = () => {
  const t = useTranslations("Locals.favorites")
  const supabase = useMemo(() => createClient(), [])
  const { user } = useUserContext()

  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)

    const [favsResult, recentResult] = await Promise.all([
      FavoritesService.getFavorites(user.id, supabase),
      FavoritesService.getRecentlyViewed(user.id, supabase),
    ])

    if (favsResult.right) setFavorites(favsResult.right)
    if (recentResult.right) setRecentlyViewed(recentResult.right)

    setIsLoading(false)
  }, [user, supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const handleRemoveFavorite = useCallback(
    async (type: SearchListingType, listingId: string) => {
      if (!user || removingIds.has(listingId)) return
      setRemovingIds((prev) => new Set(prev).add(listingId))

      const { left } = await FavoritesService.toggleFavorite(type, listingId, user.id, supabase)

      if (!left) {
        setFavorites((prev) => prev.filter((f) => f.listingId !== listingId))
      }

      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(listingId)
        return next
      })
    },
    [user, supabase, removingIds],
  )

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <FavoriteCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isEmpty = favorites.length === 0 && recentlyViewed.length === 0

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
      {favorites.length > 0 && (
        <section data-testid="favorites-section">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="size-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">
              {t("section.favorites")}
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({favorites.length})
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav) => (
              <FavoriteCard
                key={fav.id}
                item={fav}
                isRemoving={removingIds.has(fav.listingId)}
                onRemove={() => handleRemoveFavorite(fav.type, fav.listingId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed section */}
      {recentlyViewed.length > 0 && (
        <section data-testid="recently-viewed-section">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">
              {t("section.recentlyViewed")}
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({recentlyViewed.length})
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyViewed.map((item) => (
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
