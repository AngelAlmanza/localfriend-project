"use client"

import { Loader2, SearchX } from "lucide-react"
import { useTranslations } from "next-intl"
import { SearchResultItem } from "../interfaces/Local"
import { ResultCard } from "./ResultCard"
import { SearchResultSkeleton } from "./SearchResultSkeleton"

interface ResultSectionProps {
  results: SearchResultItem[]
  total: number
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  prefetchThreshold: number
  setObserverTarget: (node: HTMLDivElement | null) => void
  onSelectItem: (item: SearchResultItem) => void
}

export const ResultSection = ({
  results,
  total,
  isLoading,
  isLoadingMore,
  hasMore,
  prefetchThreshold,
  setObserverTarget,
  onSelectItem,
}: ResultSectionProps) => {
  const t = useTranslations("Locals.search")

  if (isLoading) {
    return (
      <section className="w-full lg:w-2/5 pr-4 pb-4 overflow-y-auto max-h-[calc(100vh-16rem)]" data-testid="search-results-loading">
        <div className="flex items-center justify-between mb-4">
          <div className="h-7 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
        <ul className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i}>
              <SearchResultSkeleton />
            </li>
          ))}
        </ul>
      </section>
    )
  }

  if (results.length === 0) {
    return (
      <section className="w-full lg:w-2/5 pr-4 pb-4" data-testid="search-results-empty">
        <h2 className="text-xl font-bold mb-4">
          {t("results", { count: 0 })}
        </h2>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="size-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">{t("noResults")}</p>
          <p className="text-sm text-gray-400 mt-1">{t("noResultsHint")}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full lg:w-2/5 pr-4 pb-4 overflow-y-auto max-h-[calc(100vh-16rem)]" data-testid="search-results">
      <h2 className="text-xl font-bold mb-4" data-testid="search-results-count">
        {t("results", { count: total })}
      </h2>
      <ul className="flex flex-col gap-4">
        {results.map((item, index) => (
          <li key={`${item.type}-${item.id}`}>
            {/* Place the observer trigger at the prefetch threshold position */}
            {index === prefetchThreshold - 1 && hasMore && (
              <div ref={setObserverTarget} className="h-0 w-full" />
            )}
            <ResultCard item={item} onSelect={onSelectItem} />
          </li>
        ))}
      </ul>

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="size-5 animate-spin text-primary mr-2" />
          <span className="text-sm text-gray-500">{t("loadingMore")}</span>
        </div>
      )}

      {/* End of results when no hasMore and not the observer element */}
      {!hasMore && results.length > 0 && (
        <p className="text-center text-sm text-gray-400 py-4">
          {t("endOfResults")}
        </p>
      )}
    </section>
  )
}
