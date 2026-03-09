import { createClient } from "@/src/shared/lib/supabase/client"
import { useDebouncedValue } from "@/src/shared/hooks/useDebouncedValue"
import { useUserContext } from "@/src/shared/providers/UserProvider"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { DEBOUNCED_SEARCH_DELAY, PAGE_SIZE, PREFETCH_THRESHOLD } from "../constants/filterDefaultValues"
import { SearchService } from "../services/SearchService"
import { useLocalsSearchStore, SearchFiltersState } from "../store/locals"
import { useLocalsDataStore } from "../store/localsData"

const serializeFilters = (f: SearchFiltersState) => JSON.stringify(f)

export const useInfiniteSearch = () => {
  const supabase = useMemo(() => createClient(), [])
  const { user } = useUserContext()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)

  const {
    results,
    total,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    filters,
    lastFetchedFilters,
    setResults,
    setTotal,
    setPage,
    setHasMore,
    setIsLoading,
    setIsLoadingMore,
    setLastFetchedFilters,
    appendResults,
  } = useLocalsSearchStore()

  const { favoriteProductIds, favoriteServiceIds, favoritesLoaded } = useLocalsDataStore()

  // Debounce the entire filters object so a single query fires after
  // the last filter change, regardless of which filter changed
  const serialized = serializeFilters(filters)
  const debouncedSerialized = useDebouncedValue(serialized, DEBOUNCED_SEARCH_DELAY)
  const debouncedFilters: SearchFiltersState = useMemo(
    () => JSON.parse(debouncedSerialized),
    [debouncedSerialized],
  )

  const fetchResults = useCallback(
    async (pageNum: number, append = false) => {
      if (!user || !favoritesLoaded) return

      const currentFiltersSerialized = serializeFilters(debouncedFilters)

      // Skip refetch when remounting (tab switch, minimize) with unchanged filters and existing results.
      // Use getState() to read results without adding them to the callback deps.
      if (!append && pageNum === 1) {
        const hasResults = useLocalsSearchStore.getState().results.length > 0
        if (hasResults && lastFetchedFilters === currentFiltersSerialized) return
      }

      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }

      const { left, right } = await SearchService.searchListings(
        user.id,
        supabase,
        {
          contentType: debouncedFilters.contentType,
          productCategories: debouncedFilters.selectedProductCategories,
          serviceCategories: debouncedFilters.selectedServiceCategories,
          priceMin: debouncedFilters.priceRange[0] > 0 ? debouncedFilters.priceRange[0] : null,
          priceMax: debouncedFilters.priceRange[1] < 10000 ? debouncedFilters.priceRange[1] : null,
          search: debouncedFilters.searchText,
        },
        pageNum,
        PAGE_SIZE,
        { productIds: favoriteProductIds, serviceIds: favoriteServiceIds },
      )

      if (right) {
        if (append) {
          appendResults(right.data)
        } else {
          setResults(right.data)
          setLastFetchedFilters(currentFiltersSerialized)
        }
        setTotal(right.total)
        setPage(pageNum)
        setHasMore(pageNum < right.totalPages)
      }

      if (left) {
        console.error("Search error:", left.message)
      }

      setIsLoading(false)
      setIsLoadingMore(false)
    },
    [
      user, supabase, debouncedFilters,
      favoriteProductIds, favoriteServiceIds, favoritesLoaded,
      lastFetchedFilters,
      setResults, appendResults, setTotal, setPage, setHasMore,
      setIsLoading, setIsLoadingMore, setLastFetchedFilters,
    ],
  )

  // Initial fetch + re-fetch on debounced filter changes
  useEffect(() => {
    fetchResults(1, false)
  }, [fetchResults])

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return
    fetchResults(page + 1, true)
  }, [hasMore, isLoadingMore, isLoading, page, fetchResults])

  // Intersection observer for infinite scroll
  const setObserverTarget = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (!node) return

      loadMoreTriggerRef.current = node
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore()
          }
        },
        { threshold: 0.1 },
      )
      observerRef.current.observe(node)
    },
    [loadMore],
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return {
    results,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    setObserverTarget,
    prefetchThreshold: PREFETCH_THRESHOLD,
    refetch: () => fetchResults(1, false),
  }
}
