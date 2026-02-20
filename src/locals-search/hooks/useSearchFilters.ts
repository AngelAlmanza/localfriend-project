import { useDebouncedValue } from "@/src/shared/hooks/useDebouncedValue";
import { parseNumberArray } from "@/src/shared/utils/parseNumberArray";
import { parseStringArray } from "@/src/shared/utils/parseStringArray";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DEBOUNCED_SEARCH_DELAY,
  DEFAULT_PRICE_RANGE,
  DEFAULT_RATING,
  DEFAULT_SORT,
} from "../constants/filterDefaultValues";

type Filters = {
  search: string;
  price: number[];
  categories: string[];
  sort: string;
  rating: number[];
};

export const useSearchFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() => ({
    search: searchParams.get("search") || "",
    price: parseNumberArray(searchParams.get("price"), [...DEFAULT_PRICE_RANGE]),
    categories: parseStringArray(searchParams.get("categories")).map((c) =>
      c.toUpperCase()
    ),
    sort: searchParams.get("sort") || DEFAULT_SORT,
    rating: parseNumberArray(searchParams.get("rating"), [DEFAULT_RATING]),
  }));

  const [showFiltersSection, setShowFiltersSection] = useState(false);

  const debouncedFilters = useDebouncedValue(filters, DEBOUNCED_SEARCH_DELAY);

  const updateFilter = <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      price: [...DEFAULT_PRICE_RANGE],
      categories: [],
      sort: DEFAULT_SORT,
      rating: [DEFAULT_RATING],
    });
  };

  const handleToggleFiltersSection = () => {
    setShowFiltersSection((prev) => !prev);
  };

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedFilters.search !== "") {
      params.set("search", debouncedFilters.search);
    }

    const isDefaultPrice =
      debouncedFilters.price[0] === DEFAULT_PRICE_RANGE[0] &&
      debouncedFilters.price[1] === DEFAULT_PRICE_RANGE[1];
    if (!isDefaultPrice) {
      params.set("price", debouncedFilters.price.join(","));
    }

    if (debouncedFilters.categories.length > 0) {
      params.set(
        "categories",
        debouncedFilters.categories.map((c) => c.toLowerCase()).join(",")
      );
    }

    if (debouncedFilters.sort !== DEFAULT_SORT) {
      params.set("sort", debouncedFilters.sort);
    }

    const isDefaultRating = debouncedFilters.rating[0] === DEFAULT_RATING;
    if (!isDefaultRating) {
      params.set("rating", debouncedFilters.rating.join(","));
    }

    router.push(`?${params.toString()}`, { scroll: false });
  }, [debouncedFilters, router]);

  return {
    showFiltersSection,
    handleToggleFiltersSection,

    filters,
    updateFilter,

    handleClearFilters,
  };
};