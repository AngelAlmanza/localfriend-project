import { useDebouncedValue } from "@/src/shared/hooks/useDebouncedValue";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DEBOUNCED_SEARCH_DELAY, DEFAULT_PRICE_RANGE, DEFAULT_RATING, DEFAULT_SORT } from "../constants/filterDefaultValues";

export const useSearchFilters = () => {
  const [showFiltersSection, setShowFiltersSection] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearchValue = searchParams.get("search") || "";
  const initialPriceRange =
    searchParams.get("price") || DEFAULT_PRICE_RANGE.join(",");
  const initialCategories = searchParams.get("categories") || "";
  const initialSort = searchParams.get("sort") || DEFAULT_SORT;
  const initialRating = searchParams.get("rating") || DEFAULT_RATING.toString();

  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [priceRange, setPriceRange] = useState<number[]>(
    initialPriceRange.split(",").map(Number) as number[]
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategories
      ? initialCategories.split(",").map((c) => c.toLocaleUpperCase())
      : []
  );
  const [sort, setSort] = useState(initialSort);
  const [rating, setRating] = useState<number[]>(
    initialRating.split(",").map(Number) as number[]
  );

  const debouncedSearchValue = useDebouncedValue(searchValue, DEBOUNCED_SEARCH_DELAY);
  const debouncedPriceRange = useDebouncedValue(priceRange, DEBOUNCED_SEARCH_DELAY);
  const debouncedCategories = useDebouncedValue(selectedCategories, DEBOUNCED_SEARCH_DELAY);
  const debouncedSort = useDebouncedValue(sort, DEBOUNCED_SEARCH_DELAY);
  const debouncedRating = useDebouncedValue(rating, DEBOUNCED_SEARCH_DELAY);

  const handleToggleFiltersSection = () => {
    setShowFiltersSection((prev) => !prev);
  };

  const handleSearch = () => {
    console.log("searchValue", searchValue);
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setPriceRange([...DEFAULT_PRICE_RANGE]);
    setSelectedCategories([]);
    setSort(DEFAULT_SORT);
    setRating([DEFAULT_RATING]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("price");
    params.delete("categories");
    params.delete("sort");
    params.delete("rating");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (debouncedCategories.length > 0) {
      params.set(
        "categories",
        debouncedCategories.map((c) => c.toLocaleLowerCase()).join(",")
      );
    } else {
      params.delete("categories");
    }

    if (debouncedPriceRange.length === 2) {
      params.set("price", debouncedPriceRange.join(","));
    } else {
      params.delete("price");
    }

    if (debouncedSort !== DEFAULT_SORT) {
      params.set("sort", debouncedSort);
    } else {
      params.delete("sort");
    }

    if (debouncedRating.length === 1) {
      params.set("rating", debouncedRating.join(","));
    } else {
      params.delete("rating");
    }

    if (debouncedSearchValue !== "") {
      params.set("search", debouncedSearchValue);
    } else {
      params.delete("search");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  }, [
    debouncedSearchValue,
    debouncedCategories,
    debouncedPriceRange,
    debouncedSort,
    debouncedRating,
    router,
  ]);


  return {
    showFiltersSection,
    handleToggleFiltersSection,
    searchValue,
    setSearchValue,
    priceRange,
    setPriceRange,
    selectedCategories,
    setSelectedCategories,
    sort,
    setSort,
    rating,
    setRating,
    handleClearFilters,
    handleSearch,
  };
}