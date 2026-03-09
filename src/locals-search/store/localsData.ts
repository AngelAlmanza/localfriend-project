import { create } from "zustand";
import { CategoryOption, SearchListingType } from "../interfaces/Local";

interface LocalsDataState {
  // Categories
  productCategories: CategoryOption[];
  serviceCategories: CategoryOption[];
  categoriesLoaded: boolean;
  setCategories: (product: CategoryOption[], service: CategoryOption[]) => void;

  // Favorites
  favoriteProductIds: Set<string>;
  favoriteServiceIds: Set<string>;
  favoritesLoaded: boolean;
  setFavoriteIds: (productIds: string[], serviceIds: string[]) => void;
  toggleFavorite: (id: string, type: SearchListingType, isFavorited: boolean) => void;
}

export const useLocalsDataStore = create<LocalsDataState>((set) => ({
  productCategories: [],
  serviceCategories: [],
  categoriesLoaded: false,

  favoriteProductIds: new Set<string>(),
  favoriteServiceIds: new Set<string>(),
  favoritesLoaded: false,

  setCategories: (product, service) =>
    set({ productCategories: product, serviceCategories: service, categoriesLoaded: true }),

  setFavoriteIds: (productIds, serviceIds) =>
    set({
      favoriteProductIds: new Set(productIds),
      favoriteServiceIds: new Set(serviceIds),
      favoritesLoaded: true,
    }),

  toggleFavorite: (id, type, isFavorited) =>
    set((state) => {
      const updatedProductIds = new Set(state.favoriteProductIds);
      const updatedServiceIds = new Set(state.favoriteServiceIds);
      if (type === "product") {
        isFavorited ? updatedProductIds.add(id) : updatedProductIds.delete(id);
      } else {
        isFavorited ? updatedServiceIds.add(id) : updatedServiceIds.delete(id);
      }
      return { favoriteProductIds: updatedProductIds, favoriteServiceIds: updatedServiceIds };
    }),
}));
