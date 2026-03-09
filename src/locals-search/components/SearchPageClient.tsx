"use client";

import { createClient } from "@/src/shared/lib/supabase/client";
import { useUserContext } from "@/src/shared/providers/UserProvider";
import { useCallback, useEffect, useMemo } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { useInfiniteSearch } from "../hooks/useInfiniteSearch";
import { CategoryOption, SearchResultItem } from "../interfaces/Local";
import { RegisterViewService } from "../services/RegisterViewService";
import { SearchService } from "../services/SearchService";
import { useLocalsDataStore } from "../store/localsData";
import { useLocalsSearchStore } from "../store/locals";
import { LocationBanner } from "./LocationBanner";
import { ResultDetailSection } from "./ResultDetailSection";
import { ResultSection } from "./ResultSection";
import { SearchBar } from "./SearchBar";

interface SearchPageClientProps {
  initialProductCategories: CategoryOption[];
  initialServiceCategories: CategoryOption[];
  initialFavoriteProductIds: string[];
  initialFavoriteServiceIds: string[];
}

export const SearchPageClient = ({
  initialProductCategories,
  initialServiceCategories,
  initialFavoriteProductIds,
  initialFavoriteServiceIds,
}: SearchPageClientProps) => {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useUserContext();

  const { setCategories, setFavoriteIds, categoriesLoaded, favoritesLoaded } =
    useLocalsDataStore();

  useEffect(() => {
    if (!categoriesLoaded) {
      setCategories(initialProductCategories, initialServiceCategories);
    }
  }, [categoriesLoaded, setCategories, initialProductCategories, initialServiceCategories]);

  useEffect(() => {
    if (!favoritesLoaded) {
      setFavoriteIds(initialFavoriteProductIds, initialFavoriteServiceIds);
    }
  }, [favoritesLoaded, setFavoriteIds, initialFavoriteProductIds, initialFavoriteServiceIds]);

  const {
    hasLocation,
    locationDenied,
    isRequesting,
    showBanner,
    isLoading: isLoadingLocation,
    requestGeolocation,
  } = useGeolocation();

  const {
    selectedDetail,
    isLoadingDetail,
    setSelectedDetail,
    setIsLoadingDetail,
  } = useLocalsSearchStore();

  const {
    results,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    prefetchThreshold,
    setObserverTarget,
  } = useInfiniteSearch();

  const handleSelectItem = useCallback(
    async (item: SearchResultItem) => {
      if (!user) return;
      setIsLoadingDetail(true);

      const { right } = await SearchService.getListingDetail(
        item.id,
        item.type,
        supabase,
      );

      if (right) {
        setSelectedDetail(right);
        RegisterViewService.registerView(item.type, item.id, user.id, supabase);
      }

      setIsLoadingDetail(false);
    },
    [user, supabase, setSelectedDetail, setIsLoadingDetail],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedDetail(null);
  }, [setSelectedDetail]);

  if (isLoadingLocation) {
    return null;
  }

  return (
    <div className="w-full space-y-4" data-testid="search-page">
      {showBanner && (
        <LocationBanner
          isDenied={locationDenied}
          isRequesting={isRequesting}
          onRequestLocation={requestGeolocation}
        />
      )}
      <SearchBar />
      {hasLocation && (
        <div className="flex flex-col gap-4 lg:flex-row">
          <ResultSection
            results={results}
            total={total}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            prefetchThreshold={prefetchThreshold}
            setObserverTarget={setObserverTarget}
            onSelectItem={handleSelectItem}
          />
          <ResultDetailSection
            detail={selectedDetail}
            isLoading={isLoadingDetail}
            onClose={handleCloseDetail}
          />
        </div>
      )}
    </div>
  );
};
