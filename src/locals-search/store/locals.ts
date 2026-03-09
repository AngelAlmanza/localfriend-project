import { create } from "zustand";
import {
  DEFAULT_PRICE_RANGE_MAX,
  DEFAULT_PRICE_RANGE_MIN,
} from "../constants/filterDefaultValues";
import {
  SearchContentType,
  SearchResultDetail,
  SearchResultItem,
} from "../interfaces/Local";

export interface SearchFiltersState {
  contentType: SearchContentType;
  selectedProductCategories: string[];
  selectedServiceCategories: string[];
  priceRange: [number, number];
  searchText: string;
}

interface LocalsSearchState {
  // Results
  results: SearchResultItem[];
  setResults: (results: SearchResultItem[]) => void;
  appendResults: (results: SearchResultItem[]) => void;
  total: number;
  setTotal: (total: number) => void;
  page: number;
  setPage: (page: number) => void;
  hasMore: boolean;
  setHasMore: (hasMore: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isLoadingMore: boolean;
  setIsLoadingMore: (isLoadingMore: boolean) => void;

  // Selected detail
  selectedDetail: SearchResultDetail | null;
  setSelectedDetail: (detail: SearchResultDetail | null) => void;
  isLoadingDetail: boolean;
  setIsLoadingDetail: (isLoadingDetail: boolean) => void;

  // Filters (single object for debouncing)
  filters: SearchFiltersState;
  setFilters: (filters: Partial<SearchFiltersState>) => void;

  // Favorites toggle in results
  toggleResultFavorite: (id: string, isFavorited: boolean) => void;

  // Reset
  resetSearch: () => void;
}

const INITIAL_FILTERS: SearchFiltersState = {
  contentType: "both",
  selectedProductCategories: [],
  selectedServiceCategories: [],
  priceRange: [DEFAULT_PRICE_RANGE_MIN, DEFAULT_PRICE_RANGE_MAX],
  searchText: "",
};

const INITIAL_STATE = {
  results: [] as SearchResultItem[],
  total: 0,
  page: 1,
  hasMore: true,
  isLoading: false,
  isLoadingMore: false,
  selectedDetail: null as SearchResultDetail | null,
  isLoadingDetail: false,
  filters: INITIAL_FILTERS,
};

export const useLocalsSearchStore = create<LocalsSearchState>((set) => ({
  ...INITIAL_STATE,

  setResults: (results) => set({ results }),
  appendResults: (newResults) =>
    set((state) => ({ results: [...state.results, ...newResults] })),
  setTotal: (total) => set({ total }),
  setPage: (page) => set({ page }),
  setHasMore: (hasMore) => set({ hasMore }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsLoadingMore: (isLoadingMore) => set({ isLoadingMore }),

  setSelectedDetail: (detail) => set({ selectedDetail: detail }),
  setIsLoadingDetail: (isLoadingDetail) => set({ isLoadingDetail }),

  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),

  toggleResultFavorite: (id, isFavorited) =>
    set((state) => ({
      results: state.results.map((r) =>
        r.id === id ? { ...r, isFavorited } : r,
      ),
      selectedDetail:
        state.selectedDetail?.id === id
          ? { ...state.selectedDetail, isFavorited }
          : state.selectedDetail,
    })),

  resetSearch: () => set(INITIAL_STATE),
}));
