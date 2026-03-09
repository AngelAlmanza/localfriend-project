import { FavoritesPageClient } from "@/src/saved/components/FavoritesPageClient"
import { FavoritesService } from "@/src/locals-search/services/FavoritesService"
import { createClient } from "@/src/shared/lib/supabase/server"

async function LocalsSavedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const favsResult = await FavoritesService.getFavorites(user?.id ?? "", supabase)
  const favorites = favsResult.right ?? []

  const favoriteProductIds = favorites
    .filter((f) => f.type === "product")
    .map((f) => f.listingId)
  const favoriteServiceIds = favorites
    .filter((f) => f.type === "service")
    .map((f) => f.listingId)

  const recentResult = await FavoritesService.getRecentlyViewed(
    user?.id ?? "",
    supabase,
    { productIds: favoriteProductIds, serviceIds: favoriteServiceIds },
  )

  return (
    <FavoritesPageClient
      initialFavorites={favorites}
      initialRecentlyViewed={recentResult.right ?? []}
    />
  )
}

export default LocalsSavedPage
