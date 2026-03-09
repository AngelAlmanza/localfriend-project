import { createClient } from "@/src/shared/lib/supabase/client"
import { useUserContext } from "@/src/shared/providers/UserProvider"
import { useCallback, useMemo, useState } from "react"
import { SearchListingType } from "../interfaces/Local"
import { FavoritesService } from "../services/FavoritesService"
import { useLocalsSearchStore } from "../store/locals"
import { useLocalsDataStore } from "../store/localsData"

export const useFavoriteToggle = () => {
  const supabase = useMemo(() => createClient(), [])
  const { user } = useUserContext()
  const { toggleResultFavorite } = useLocalsSearchStore()
  const { toggleFavorite } = useLocalsDataStore()
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  const toggle = useCallback(
    async (type: SearchListingType, listingId: string) => {
      if (!user || togglingIds.has(listingId)) return

      setTogglingIds((prev) => new Set(prev).add(listingId))

      const { left, right } = await FavoritesService.toggleFavorite(
        type,
        listingId,
        user.id,
        supabase,
      )

      if (right !== undefined && left === undefined) {
        toggleResultFavorite(listingId, right)
        toggleFavorite(listingId, type, right)
      }

      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(listingId)
        return next
      })

      return right
    },
    [user, supabase, toggleResultFavorite, toggleFavorite, togglingIds],
  )

  const isToggling = useCallback(
    (id: string) => togglingIds.has(id),
    [togglingIds],
  )

  return { toggle, isToggling }
}
